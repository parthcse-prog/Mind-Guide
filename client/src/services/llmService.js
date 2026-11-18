import axios from "axios";

const GATEWAY_URL = "https://ai-services.mietjmu.in/gateway/llm/chat";
const TOKEN = import.meta.env.VITE_OPENAI_API_KEY || "dgx_942ea91f275263b6ee47220c55583ba3e9ca8fa9f7904833";

/**
 * Sanitizes messages so only clean { role, content } pairs are passed to ai-services,
 * stripping internal DB fields like _id, timestamp, etc.
 */
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && m.role && m.content)
    .map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content.trim() : String(m.content),
    }));
}

/**
 * Call the AI Services Gateway (https://ai-services.mietjmu.in)
 * Uses native fetch with credentials: 'omit' to prevent cross-origin cookie / CORS issues in browsers,
 * and falls back to the server /api/v1/ai/chat proxy if direct browser connection is blocked.
 */
export async function callGatewayLLMDirect(messages, preferredModel = "llama3.1:8b") {
  const cleanMessages = sanitizeMessages(messages);
  const modelsToTry = [preferredModel, preferredModel !== "gpt-oss:20b" ? "gpt-oss:20b" : "llama3.1:8b"];

  // 1. Direct browser fetch to ai-services.mietjmu.in
  for (const model of modelsToTry) {
    try {
      const response = await fetch(GATEWAY_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit", // Crucial: prevents CORS credential conflicts
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: cleanMessages,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        const text =
          resData?.message?.content ||
          resData?.data?.response ||
          resData?.response ||
          (typeof resData === "string" ? resData : null);

        if (text) return text;
      } else {
        const errText = await response.text();
        console.warn(`Direct AI Services responded with status ${response.status} for ${model}:`, errText);
      }
    } catch (directErr) {
      console.warn(`Direct fetch to ${GATEWAY_URL} (${model}) failed:`, directErr.message);
    }
  }

  // 2. Server proxy fallback (/api/v1/ai/chat)
  try {
    console.log("Direct AI Services connection failed or timed out. Falling back to backend AI proxy...");
    const proxyRes = await axios.post("/api/v1/ai/chat", {
      messages: cleanMessages,
      model: preferredModel,
    });

    if (proxyRes.data?.success && proxyRes.data?.data?.response) {
      return proxyRes.data.data.response;
    }
  } catch (proxyErr) {
    console.error("Backend AI proxy also failed:", proxyErr?.response?.data || proxyErr.message);
  }

  // 3. Alternate chat endpoint fallback (/api/v1/chat)
  try {
    const chatRes = await axios.post("/api/v1/chat", {
      messages: cleanMessages,
    });
    if (chatRes.data) {
      return typeof chatRes.data === "string" ? chatRes.data : JSON.stringify(chatRes.data);
    }
  } catch (chatErr) {
    console.error("All AI service paths failed:", chatErr?.response?.data || chatErr.message);
  }

  throw new Error("Unable to connect to Saarthi AI Services. Please check your network connection.");
}
