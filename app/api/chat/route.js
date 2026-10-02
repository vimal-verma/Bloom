import { NextResponse } from "next/server";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const MODEL_NAME = "pregnancy-gemma";

export async function POST(req) {
  try {
    const { messages, userContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // Build personalized system context based on mom's current stage
    let systemPreamble = "You are Pregnancy Gemma, a specialized, compassionate, evidence-based obstetric companion.";
    if (userContext) {
      systemPreamble += ` The expectant mother is currently at Week ${userContext.currentWeek}, Day ${userContext.currentDayOfWeek} (Trimester ${userContext.trimester}). Her baby is currently about the size of a ${userContext.weekInfo?.fruit || "little seed"}.`;
    }
    systemPreamble += " Provide warm, supportive, clear, and reassuring answers about fetal development, pregnancy symptoms, maternal nutrition, hydration, and wellness. CRITICAL SAFETY: Always advise contacting a doctor or triage immediately for severe bleeding, intense abdominal pain, sudden vision changes/swelling, or reduced fetal movement.";

    // Convert messages to Gemma turn template
    let prompt = "";
    messages.forEach((msg, idx) => {
      if (idx === 0 && msg.role === "user") {
        prompt += `<start_of_turn>user\n[Context: ${systemPreamble}]\n\n${msg.content}<end_of_turn>\n`;
      } else if (msg.role === "user") {
        prompt += `<start_of_turn>user\n${msg.content}<end_of_turn>\n`;
      } else if (msg.role === "assistant" || msg.role === "model") {
        prompt += `<start_of_turn>model\n${msg.content}<end_of_turn>\n`;
      }
    });

    prompt += `<start_of_turn>model\n`;

    // Connect to local Ollama instance
    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.3,
          num_predict: 768
        }
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return NextResponse.json(
        { 
          error: `Ollama error (${ollamaResponse.status}): ${errorText}`,
          tip: "Ensure 'ollama run pregnancy-gemma' is running locally on port 11434."
        },
        { status: 502 }
      );
    }

    // Stream back to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // retain incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const parsed = JSON.parse(trimmed);
                if (parsed.response) {
                  controller.enqueue(encoder.encode(parsed.response));
                }
              } catch (e) {
                // Wait for more chunks
              }
            }
          }

          // Process any trailing line in buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              if (parsed.response) {
                controller.enqueue(encoder.encode(parsed.response));
              }
            } catch (e) {}
          }
        } catch (streamErr) {
          console.error("Stream reading error:", streamErr);
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform"
      }
    });

  } catch (error) {
    console.error("API /api/chat error:", error);
    return NextResponse.json(
      {
        error: "Could not connect to local pregnancy-gemma model.",
        details: error.message,
        tip: "Please make sure Ollama is open and running on your machine with 'pregnancy-gemma'."
      },
      { status: 503 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json({ status: "offline", error: "Ollama returned error" }, { status: 503 });
    }
    const data = await res.json();
    const hasPregnancyGemma = data.models?.some((m) => m.name.includes("pregnancy-gemma"));
    return NextResponse.json({
      status: "online",
      model: MODEL_NAME,
      available: hasPregnancyGemma,
      models: data.models?.map((m) => m.name)
    });
  } catch (err) {
    return NextResponse.json({
      status: "offline",
      error: "Ollama is not responding at " + OLLAMA_HOST,
      tip: "Run 'ollama serve' or open the Ollama app."
    }, { status: 503 });
  }
}
