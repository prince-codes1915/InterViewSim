import { NextRequest, NextResponse } from "next/server";
import { googleAI, MODEL_EVALUATION } from "@/lib/gemini";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EvaluationResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, role, techStack, interviewId } = body;

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: "Invalid payload: transcript array is required" },
        { status: 400 }
      );
    }

    const techStackList = Array.isArray(techStack) ? techStack.join(", ") : (techStack || "General Tech");
    const formattedTranscript = transcript
      .map((t: any) => {
        const isUser = t.role === "user" || t.speaker === "user";
        const roleLabel = isUser ? "CANDIDATE RESPONSE" : "INTERVIEWER QUESTION";
        return `[${roleLabel}]: ${t.text || t.content || ""}`;
      })
      .join("\n\n");

    const prompt = `You are an unforgiving, candid, FAANG-level Bar Raiser & Principal Engineering Director evaluating a candidate's technical interview transcript.

Target Role: ${role || "Software Engineer"}
Required Tech Stack: ${techStackList}

Transcript to Evaluate:
${formattedTranscript || "No candidate answers recorded."}

STRICT TIER SCORING RUBRIC (0-100 Scale):
You MUST evaluate candidate answers strictly against these exact numerical standard tiers:

- 0 to 25 (Fail / Non-Responsive):
  Candidate gave empty answers, silence, gibberish, "I don't know", "idk", "pass", "no idea", or completely irrelevant short answers. Total failure to demonstrate engineering ability.
- 26 to 45 (Poor / Major Technical Gaps):
  Candidate gave minimal 1-2 sentence answers, made major technical errors, lacked basic understanding of ${techStackList}, or completely avoided answering core technical details.
- 46 to 65 (Mediocre / Below Bar):
  Candidate gave high-level, generic buzzword answers without explaining mechanisms, code patterns, memory/performance trade-offs, or STAR structure. Fails FAANG bar raiser standard.
- 66 to 82 (Competent / Pass):
  Candidate gave solid, technically accurate answers with clear reasoning, core ${techStackList} concepts, and reasonable problem-solving structure.
- 83 to 100 (Strong Hire / Bar Raiser Exception):
  Candidate gave exceptional deep-dive answers with specific architectural trade-offs, low-level optimizations, STAR metrics (latency, throughput, scaling numbers), and edge-case handling.

MANDATORY RULES:
1. PENALIZE HEAVILY if the candidate said "I don't know", skipped questions, gave single-word responses, or gave non-technical answers. Assign overall score strictly in the 10-40 range for such transcripts.
2. DO NOT flatter or inflate scores. If the candidate performed poorly or vaguely, the overall score MUST be below 50.
3. Compute overallScore as a fair weighted reflection of technicalScore (40%), problemSolvingScore (35%), and communicationScore (25%).

Provide output strictly as JSON matching this schema:
- overallScore: number (0-100)
- technicalScore: number (0-100)
- communicationScore: number (0-100)
- problemSolvingScore: number (0-100)
- strengths: array of strings (2-4 honest strengths or baseline observations)
- areasForImprovement: array of strings (3-5 sharp, candid, actionable technical gaps observed)
- summaryFeedback: string (direct, realistic executive evaluation paragraph)
- keyTakeaways: array of strings (3 concrete actionable takeaways)`;

    let evaluationResult: EvaluationResult;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "mock_gemini_key" && apiKey !== "demo-api-key") {
      try {
        const response = await googleAI.models.generateContent({
          model: MODEL_EVALUATION,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT" as any,
              properties: {
                overallScore: { type: "INTEGER" as any },
                technicalScore: { type: "INTEGER" as any },
                communicationScore: { type: "INTEGER" as any },
                problemSolvingScore: { type: "INTEGER" as any },
                strengths: { type: "ARRAY" as any, items: { type: "STRING" as any } },
                areasForImprovement: { type: "ARRAY" as any, items: { type: "STRING" as any } },
                summaryFeedback: { type: "STRING" as any },
                keyTakeaways: { type: "ARRAY" as any, items: { type: "STRING" as any } },
              },
              required: [
                "overallScore",
                "technicalScore",
                "communicationScore",
                "problemSolvingScore",
                "strengths",
                "areasForImprovement",
                "summaryFeedback",
                "keyTakeaways",
              ],
            },
          },
        });

        const text = response.text;
        if (text) {
          evaluationResult = JSON.parse(text);
        } else {
          throw new Error("Empty text returned from Gemini API");
        }
      } catch (geminiError: any) {
        console.warn("Gemini Pro evaluation call failed, using intelligent fallback analysis:", geminiError?.message || geminiError);
        evaluationResult = generateFallbackEvaluation(role, techStackList, transcript);
      }
    } else {
      evaluationResult = generateFallbackEvaluation(role, techStackList, transcript);
    }

    // Persist to Firestore if interviewId is provided
    if (interviewId && interviewId !== "demo-interview-1") {
      try {
        const feedbackRef = doc(db, "interviews", interviewId, "feedback", "summary");
        await setDoc(feedbackRef, {
          ...evaluationResult,
          updatedAt: new Date().toISOString(),
        });
      } catch (dbError) {
        console.warn("Firestore save failed or running offline mode:", dbError);
      }
    }

    return NextResponse.json({ evaluation: evaluationResult });
  } catch (error: any) {
    console.error("Error evaluating interview:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview", details: error.message },
      { status: 500 }
    );
  }
}

function generateFallbackEvaluation(role: string, techStack: string, transcript: any[]): EvaluationResult {
  const userMessages = transcript.filter((t) => t.role === "user" || t.speaker === "user");
  const fullUserText = userMessages.map((t) => (t.text || t.content || "").toLowerCase()).join(" ");
  const totalUserWords = userMessages.reduce((acc, t) => acc + (t.text ? t.text.split(/\s+/).filter(Boolean).length : 0), 0);
  const avgWordsPerAnswer = userMessages.length > 0 ? totalUserWords / userMessages.length : 0;

  // Detect negative / evasive phrases
  const negativeRegex = /\b(i don'?t know|idk|no idea|pass|not sure|skip|no clue|dunno|help|none|n\/a)\b/gi;
  const negativeMatches = (fullUserText.match(negativeRegex) || []).length;

  // Detect technical keyword presence matching tech stack
  const techTerms = techStack.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  const matchedTerms = techTerms.filter((term) => fullUserText.includes(term));

  // Tier 1: Non-responsive, silence, or empty answers (< 15 total words or mostly "don't know")
  if (userMessages.length === 0 || totalUserWords < 15 || (negativeMatches >= userMessages.length && userMessages.length > 0)) {
    return {
      overallScore: 22,
      technicalScore: 18,
      communicationScore: 28,
      problemSolvingScore: 20,
      strengths: [
        "Initiated candidate voice interview session.",
        "Attempted connection with interviewer.",
      ],
      areasForImprovement: [
        "Candidate failed to provide substantive answers or stated 'I don't know' across questions.",
        "Zero technical depth or domain explanations provided for the requested position.",
        "Must speak into the microphone and elaborate on core technical concepts to receive candidate consideration.",
      ],
      summaryFeedback: `UNSATISFACTORY / FAIL: The candidate provided negligible response data for a ${role} position. Basic technical concepts were not explained, resulting in heavy penalties across all dimensions.`,
      keyTakeaways: [
        "Review core fundamentals of " + techStack + " before re-attempting.",
        "Avoid skipping questions; attempt to break down problems even if uncertain.",
        "Ensure your audio input or text input is active throughout the session.",
      ],
    };
  }

  // Tier 2: Extremely brief or evasive answers (< 20 avg words per answer or high evasiveness)
  if (avgWordsPerAnswer < 20 || negativeMatches > 1) {
    return {
      overallScore: 42,
      technicalScore: 38,
      communicationScore: 48,
      problemSolvingScore: 40,
      strengths: [
        "Responded to questions without dropping out.",
        "Maintained minimal basic communication flow.",
      ],
      areasForImprovement: [
        `Answers were overly brief and surface-level for a ${role} candidate bar.`,
        `Failed to detail architectural patterns, memory management, or performance trade-offs in ${techStack}.`,
        "Did not structure answers using the STAR method (Situation, Task, Action, Result).",
      ],
      summaryFeedback: `BELOW BAR: The candidate's answers lacked the required technical depth for a ${role}. Explanations were brief and failed to demonstrate practical proficiency in ${techStack}.`,
      keyTakeaways: [
        "Elaborate thoroughly on implementation details rather than giving 1-sentence summaries.",
        "Explicitly mention edge-case handling and production trade-offs.",
        "Incorporate concrete STAR metrics when discussing past experience.",
      ],
    };
  }

  // Tier 3: Moderate answers, missing deep trade-offs or key keywords (< 45 avg words or low keyword density)
  if (avgWordsPerAnswer < 45 || matchedTerms.length < 2) {
    return {
      overallScore: 61,
      technicalScore: 58,
      communicationScore: 66,
      problemSolvingScore: 60,
      strengths: [
        `Demonstrated basic familiarity with ${techStack} terminology.`,
        "Maintained coherent communication flow during technical questions.",
      ],
      areasForImprovement: [
        `Explanations remained high-level without diving into advanced ${techStack} mechanics or scaling.`,
        "Lacked quantitative metrics (e.g. latency improvement %, load scaling stats) to substantiate claims.",
        "System design reasoning needs more explicit fault tolerance and caching strategies.",
      ],
      summaryFeedback: `MEDIOCRE: The candidate demonstrated foundational understanding for a ${role}, but answers fell short of senior technical standards. Greater technical specificity and trade-off analysis are needed.`,
      keyTakeaways: [
        "Detail exact technical mechanisms (e.g., event loop mechanics, memory garbage collection).",
        "Quantify past project achievements with hard numbers and metrics.",
        "Proactively address scalability and database query optimizations.",
      ],
    };
  }

  // Tier 4: Strong detailed responses (> 45 avg words + tech stack depth)
  return {
    overallScore: 78,
    technicalScore: 76,
    communicationScore: 82,
    problemSolvingScore: 77,
    strengths: [
      `Demonstrated solid practical competence with ${techStack} concepts.`,
      "Communicated responses with clear structure and good flow.",
      "Provided relevant technical context and architectural reasoning.",
    ],
    areasForImprovement: [
      `Deeper technical elaboration required for advanced ${techStack} low-level profiling.`,
      "System design answers can be further strengthened with explicit disaster recovery and load balancing details.",
      "Include more quantitative metrics to demonstrate business impact.",
    ],
    summaryFeedback: `COMPETENT PASS: Solid performance for a ${role}. The candidate effectively articulated technical concepts and demonstrated strong problem-solving capabilities with room for minor polish.`,
    keyTakeaways: [
      "Quantify your accomplishments with exact numbers or percentages.",
      "Practice breaking down complex distributed systems before implementing.",
      "Prepare deep-dive examples of production debugging scenarios.",
    ],
  };
}
