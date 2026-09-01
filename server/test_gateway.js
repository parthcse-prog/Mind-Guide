const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://ai-services.mietjmu.in/gateway/llm/chat', {
      model: "gemma3:27b",
      messages: [{role: "user", content: "test"}]
    }, {
      headers: {
        'Authorization': 'Bearer dgx_942ea91f275263b6ee47220c55583ba3e9ca8fa9f7904833',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log(res.data);
  } catch (err) {
    console.log(err.response ? err.response.data : err.message);
  }
}

test();
