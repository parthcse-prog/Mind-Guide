const axios = require("axios");

/**
 * Helper utility to send chat messages to custom Gateway LLM API
 * Endpoint: https://ai-services.mietjmu.in/gateway/llm/chat
 * Returned format:
 * {
 *   "success": true,
 *   "model": "qwen3-coder:30b",
 *   "message": { "role": "assistant", "content": "..." },
 *   "usage": { ... }
 * }
 */
async function callGatewayLLM(messages, model = "llama3.1:8b") {
  const token = process.env.OPENAI_API_KEY || "dgx_942ea91f275263b6ee47220c55583ba3e9ca8fa9f7904833";
  const endpoint = process.env.LLM_GATEWAY_URL || "https://ai-services.mietjmu.in/gateway/llm/chat";

  // Ensure clean messages format for ai-services
  const cleanMessages = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && m.role && m.content)
    .map((m) => ({ role: m.role, content: String(m.content).trim() }));

  const modelsToTry = [model, model !== "gpt-oss:20b" ? "gpt-oss:20b" : "llama3.1:8b"];

  let lastError = null;
  for (const currentModel of modelsToTry) {
    try {
      const response = await axios.post(
        endpoint,
        {
          model: currentModel,
          messages: cleanMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        }
      );

      const resData = response.data;

      if (resData?.message?.content) {
        return resData.message.content;
      } else if (resData?.data?.response) {
        return resData.data.response;
      } else if (resData?.response) {
        return resData.response;
      } else if (typeof resData === "string") {
        return resData;
      }
    } catch (error) {
      lastError = error;
      console.warn(`callGatewayLLM failed with model ${currentModel}:`, error?.response?.data || error.message);
    }
  }

  console.error("All gateway LLM models failed. Last error:", lastError?.response?.data || lastError?.message);
  throw lastError || new Error("Failed to communicate with AI Services");
}

module.exports = { callGatewayLLM };
