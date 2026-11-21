const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const router = express.Router();
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

// Sanitize text for speech synthesis
function sanitizeForSpeech(text) {
  if (!text) return "";
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "")
    .replace(/[\*\#\`\_\~\>\|\-\+\=\[\]\(\)]+/g, " ")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Escape XML special characters for SSML safety
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

// Distinct Voice Mappings:
// Maya Lin (Female): en-US-JennyNeural / hi-IN-SwaraNeural
// Alex (Male 1): en-US-GuyNeural / hi-IN-MadhurNeural (+0Hz pitch, +0% rate)
// Marcus Cole (Male 2): en-GB-RyanNeural / hi-IN-MadhurNeural (-10Hz pitch, +3% rate - deep commanding male tone)
// Ethan Rostova (Male 3): en-US-ChristopherNeural / hi-IN-MadhurNeural (+2Hz pitch, +3% rate - energetic youthful male tone)
function getVoiceConfig(counselorName = "", gender = "female", isHindi = false) {
  const norm = String(counselorName).toLowerCase();
  const isExplicitMale = norm.includes("ethan") || norm.includes("alex") || norm.includes("marcus") || norm.includes("saarthi");
  const isExplicitFemale = norm.includes("maya");
  const isFemale = isExplicitFemale || (!isExplicitMale && gender === "female");

  if (isFemale) {
    return {
      voiceName: isHindi ? "hi-IN-SwaraNeural" : "en-US-JennyNeural",
      xmlLang: isHindi ? "hi-IN" : "en-US",
      pitch: "+0Hz",
      rate: "+0%",
    };
  }

  if (norm.includes("marcus")) {
    return {
      voiceName: isHindi ? "hi-IN-MadhurNeural" : "en-GB-RyanNeural",
      xmlLang: isHindi ? "hi-IN" : "en-GB",
      pitch: isHindi ? "-10Hz" : "-5Hz",
      rate: "+3%",
    };
  }

  if (norm.includes("ethan")) {
    return {
      voiceName: isHindi ? "hi-IN-MadhurNeural" : "en-US-ChristopherNeural",
      xmlLang: isHindi ? "hi-IN" : "en-US",
      pitch: isHindi ? "+2Hz" : "+3Hz",
      rate: "+3%",
    };
  }

  // Alex / Default Saarthi Male
  return {
    voiceName: isHindi ? "hi-IN-MadhurNeural" : "en-US-GuyNeural",
    xmlLang: isHindi ? "hi-IN" : "en-US",
    pitch: "+0Hz",
    rate: "+0%",
  };
}

/**
 * POST /api/v1/voice/tts
 * Generates natural audio using Edge-TTS in ~0.5s with distinct voices
 */
router.post("/tts", async (req, res) => {
  try {
    const { text, language = "en", counselorName = "", gender = "female" } = req.body;
    const cleanText = sanitizeForSpeech(text);

    if (!cleanText) {
      return res.status(400).json({ success: false, message: "No text provided for TTS" });
    }

    const isHindi = language === "hi" || /[\u0900-\u097F]/.test(cleanText);
    const config = getVoiceConfig(counselorName, gender, isHindi);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      config.voiceName,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    );

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.xmlLang}"><voice name="${config.voiceName}"><prosody pitch="${config.pitch}" rate="${config.rate}">${escapeXml(cleanText)}</prosody></voice></speak>`;

    const streamObj = tts.rawToStream(ssml);

    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    });

    streamObj.audioStream.pipe(res);

    streamObj.audioStream.on("error", (streamErr) => {
      console.error("Edge-TTS Audio Stream Error:", streamErr);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Audio generation failed" });
      }
    });

    req.on("close", () => {
      if (streamObj.audioStream && !streamObj.audioStream.destroyed) {
        streamObj.audioStream.destroy();
      }
    });
  } catch (err) {
    console.error("Edge-TTS Route Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Internal Server Error in TTS" });
    }
  }
});

module.exports = router;
