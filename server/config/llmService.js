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
async function callGatewayLLM(messages, model = "qwen3-coder:30b") {
  const token = process.env.OPENAI_API_KEY;
  const endpoint = process.env.LLM_GATEWAY_URL || "https://ai-services.mietjmu.in/gateway/llm/chat";

  try {
    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
    } else {
      throw new Error(`Unexpected gateway LLM response format: ${JSON.stringify(resData)}`);
    }
  } catch (error) {
    console.error("Error in callGatewayLLM:", error?.response?.data || error.message);
    throw error;
  }
}

module.exports = { callGatewayLLM };
