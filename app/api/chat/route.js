import { NextResponse } from "next/server";

const DEFAULT_OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const DEFAULT_MODEL_NAME = "pregnancy-gemma";

export async function POST(req) {
  try {
    const { messages, userContext, aiConfig } = await req.json();

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

    const provider = aiConfig?.provider || "ollama";

    // -------------------------------------------------------------
    // PROVIDER 1: GOOGLE GEMINI CLOUD API (Useful on Render)
    // -------------------------------------------------------------
    if (provider === "gemini") {
      const apiKey = aiConfig?.apiKey?.trim() || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Google Gemini API Key is missing. Please provide your API key in AI settings." },
          { status: 400 }
        );
      }

      // Convert messages to Gemini format
      const contents = messages.map((m) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPreamble }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800
          }
        })
      });

      if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        return NextResponse.json(
          { error: `Gemini API error (${geminiRes.status}): ${errorText}` },
          { status: 502 }
        );
      }

      // Stream Gemini SSE events to client text stream
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          const reader = geminiRes.body.getReader();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  try {
                    const jsonStr = trimmed.replace("data: ", "").trim();
                    const parsed = JSON.parse(jsonStr);
                    const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textChunk) {
                      controller.enqueue(encoder.encode(textChunk));
                    }
                  } catch (e) {
                    // Ignore SSE json chunk errors
                  }
                }
              }
            }
          } catch (streamErr) {
            console.error("Gemini stream error:", streamErr);
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
    }

    // -------------------------------------------------------------
    // PROVIDER 2: OLLAMA (Local or Custom Host URL like Ngrok / Remote)
    // -------------------------------------------------------------
    const targetHost = (aiConfig?.ollamaHost?.trim() || DEFAULT_OLLAMA_HOST).replace(/\/+$/, "");
    let modelName = aiConfig?.ollamaModel?.trim() || DEFAULT_MODEL_NAME;

    // Smart model detection: Check available models on the host
    try {
      const tagsRes = await fetch(`${targetHost}/api/tags`, { method: "GET", signal: AbortSignal.timeout(3000) });
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const availableModelNames = (tagsData.models || []).map((m) => m.name.toLowerCase());
        
        // If requested model isn't installed, find a compatible fallback
        const hasRequested = availableModelNames.some((m) => m.includes(modelName.toLowerCase()));
        if (!hasRequested) {
          const fallbackCandidates = ["gemma2:2b", "gemma2", "gemma:2b", "gemma", "llama3.2", "mistral", "phi3"];
          for (const cand of fallbackCandidates) {
            const match = tagsData.models?.find((m) => m.name.toLowerCase().includes(cand));
            if (match) {
              modelName = match.name;
              break;
            }
          }
          // If still no candidate, pick the first available model
          if (tagsData.models && tagsData.models.length > 0 && !hasRequested) {
            modelName = tagsData.models[0].name;
          }
        }
      }
    } catch (tagErr) {
      // Host check timed out or failed, proceed with original modelName
    }

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

    const ollamaResponse = await fetch(`${targetHost}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
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
          error: `Ollama error from ${targetHost} (${ollamaResponse.status}): ${errorText}`,
          tip: `Ensure Ollama is running on '${targetHost}'. If 'pregnancy-gemma' is not installed, run 'ollama run gemma2:2b' or 'ollama create pregnancy-gemma -f Modelfile'.`
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
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const parsed = JSON.parse(trimmed);
                if (parsed.response) {
                  controller.enqueue(encoder.encode(parsed.response));
                }
              } catch (e) {
                // Ignore incomplete line
              }
            }
          }

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
        error: "Could not connect to the AI model.",
        details: error.message,
        tip: "Please check your OLLAMA_HOST URL or API key in AI settings."
      },
      { status: 503 }
    );
  }
}

// Health check endpoint for checking Ollama host
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const hostParam = searchParams.get("host") || DEFAULT_OLLAMA_HOST;
  const targetHost = hostParam.replace(/\/+$/, "");

  try {
    const res = await fetch(`${targetHost}/api/tags`, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json({ status: "offline", error: "Ollama returned error", host: targetHost }, { status: 503 });
    }
    const data = await res.json();
    const hasPregnancyGemma = data.models?.some((m) => m.name.includes("pregnancy-gemma"));
    return NextResponse.json({
      status: "online",
      host: targetHost,
      available: hasPregnancyGemma,
      models: data.models?.map((m) => m.name)
    });
  } catch (err) {
    return NextResponse.json({
      status: "offline",
      host: targetHost,
      error: `Could not connect to ${targetHost}`,
      tip: "Make sure Ollama is running or check the URL."
    }, { status: 503 });
  }
}
