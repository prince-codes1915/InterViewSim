import { NextRequest, NextResponse } from "next/server";
import { googleAI, MODEL_QUESTION_GEN } from "@/lib/gemini";
import { Question } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, techStack, yearsExperience } = body;

    if (!role || !techStack || yearsExperience === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: role, techStack, and yearsExperience" },
        { status: 400 }
      );
    }

    const techStackList = Array.isArray(techStack) ? techStack.join(", ") : techStack;
    const prompt = `You are a Senior Technical Interviewer conducting a mock interview.
Role: ${role}
Tech Stack: ${techStackList}
Experience Level: ${yearsExperience} years.

Generate exactly 5 realistic, challenging, and insightful interview questions tailored specifically to this role and experience level.
Include a mix of Technical, Behavioral, System Design, and Problem Solving questions.

Return a JSON array where each object has:
- id: number (1 to 5)
- question: string (the interview question)
- category: string (one of "Technical", "Behavioral", "System Design", "Problem Solving")`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "mock_gemini_key" && apiKey !== "demo-api-key") {
      try {
        const response = await googleAI.models.generateContent({
          model: MODEL_QUESTION_GEN,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  id: { type: "INTEGER" as any },
                  question: { type: "STRING" as any },
                  category: {
                    type: "STRING" as any,
                    enum: ["Technical", "Behavioral", "System Design", "Problem Solving"],
                  },
                },
                required: ["id", "question", "category"],
              },
            },
          },
        });

        const text = response.text;
        if (text) {
          const questions: Question[] = JSON.parse(text);
          return NextResponse.json({ questions });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, using high-quality fallback generator:", geminiError?.message || geminiError);
      }
    }

    // High quality tailored fallback generator
    const questions: Question[] = [
      {
        id: 1,
        question: `Can you walk me through your recent experience with ${techStackList.split(",")[0] || role} and how you architect performant solutions for ${role} roles?`,
        category: "Technical",
      },
      {
        id: 2,
        question: `Describe a situation where a critical production bug occurred in your ${techStackList} stack. How did you diagnose, debug, and prevent recurrence?`,
        category: "Problem Solving",
      },
      {
        id: 3,
        question: `How would you design a scalable microservices or serverless architecture using ${techStackList} to handle high traffic and low latency?`,
        category: "System Design",
      },
      {
        id: 4,
        question: `Tell me about a time you had a technical disagreement with a team member or product manager regarding ${techStackList.split(",")[1] || "code architecture"}. How was it resolved?`,
        category: "Behavioral",
      },
      {
        id: 5,
        question: `Given ${yearsExperience} years of experience, how do you approach technical debt, code reviews, and maintaining code quality under tight product deadlines?`,
        category: "Technical",
      },
    ];

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Error in generate-questions route:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions", details: error.message },
      { status: 500 }
    );
  }
}
