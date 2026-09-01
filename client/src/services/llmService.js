import axios from "axios";

const GATEWAY_URL = "https://ai-services.mietjmu.in/gateway/llm/chat";
const TOKEN = import.meta.env.VITE_OPENAI_API_KEY || "dgx_942ea91f275263b6ee47220c55583ba3e9ca8fa9f7904833";

export async function callGatewayLLMDirect(messages, model = "qwen3-coder:30b") {
  try {
    const response = await axios.post(
      GATEWAY_URL,
      {
        model,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
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
      return JSON.stringify(resData);
    }
  } catch (error) {
    console.error("Error in direct callGatewayLLMDirect:", error?.response?.data || error.message);
    throw error;
  }
}
