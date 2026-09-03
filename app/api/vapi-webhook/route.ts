import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { message } = payload;

    if (message && message.type === "end-of-call-report") {
      const { call, artifact, transcript } = message;
      const callId = call?.id;
      const fullTranscript = transcript || artifact?.transcript;

      console.log(`[Vapi Webhook] Received end-of-call report for Call ID: ${callId}`);
      console.log(`[Vapi Webhook] Transcript length: ${fullTranscript ? fullTranscript.length : 0} chars`);

      // Webhook acknowledges processing successfully
      return NextResponse.json({
        status: "success",
        receivedCallId: callId,
        transcriptLength: fullTranscript ? fullTranscript.length : 0,
      });
    }

    return NextResponse.json({ status: "acknowledged" });
  } catch (error: any) {
    console.error("[Vapi Webhook Error]:", error);
    return NextResponse.json(
      { error: "Webhook processing error", details: error.message },
      { status: 500 }
    );
  }
}
