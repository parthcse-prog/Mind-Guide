const axios = require('axios');

async function test() {
    try {
        const res = await axios.get("https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_report");
        console.log("Report response:", res.data);
    } catch (e) {
        console.error("Error fetching report:", e.message);
    }
}
test();
