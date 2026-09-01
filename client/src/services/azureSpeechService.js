// Microsoft Azure Neural Text-to-Speech & Viseme Audio Service

export const AZURE_NEURAL_VOICES = {
  female: ["en-US-JennyNeural", "en-US-AriaNeural", "en-IN-NeerjaNeural"],
  male: ["en-US-GuyNeural", "en-US-DavisNeural", "en-IN-PrabhatNeural"],
};

// Azure Viseme ID (0-21) to 3D Avatar morph target influence map
export const AZURE_VISEME_MAP = {
  0: { aa: 0, e: 0, i: 0, o: 0, u: 0, jaw: 0, pp: 0, ff: 0 },
  1: { aa: 0.6, jaw: 0.4 }, // ae, ax, ah
  2: { aa: 0.8, jaw: 0.6 }, // aa
  3: { o: 0.8, jaw: 0.5 },  // ao
  4: { e: 0.7, jaw: 0.3 },  // ey, eh
  5: { e: 0.6, jaw: 0.3 },  // er
  6: { i: 0.7, jaw: 0.2 },  // y, iy, ih
  7: { u: 0.8, jaw: 0.2 },  // w, uw
  8: { o: 0.7, jaw: 0.4 },  // ow
  9: { o: 0.8, jaw: 0.5 },  // aw
  10: { o: 0.7, i: 0.4, jaw: 0.4 }, // oy
  11: { e: 0.7, i: 0.4, jaw: 0.3 }, // ay
  12: { aa: 0.3, jaw: 0.2 }, // h
  13: { e: 0.4, jaw: 0.2 },  // r
  14: { i: 0.5, jaw: 0.2 },  // l
  15: { i: 0.3, jaw: 0.1 },  // s, z
  16: { i: 0.4, o: 0.3, jaw: 0.2 }, // sh, ch, jh
  17: { e: 0.4, jaw: 0.2 },  // th, dh
  18: { ff: 0.7, jaw: 0.1 }, // f, v
  19: { pp: 0.8, jaw: 0.0 }, // m, b, p (lip closure)
  20: { i: 0.4, jaw: 0.2 },  // n, ng, t, d
  21: { i: 0.4, jaw: 0.2 },  // k, g
};

// Text sanitizer regex
export const sanitizeTextForSpeech = (text) => {
  if (!text) return "";
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "")
    .replace(/[\*\#\`\_\~\>\|\-\+\=\[\]\(\)]+/g, " ")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

let currentActiveAudio = null;

export const stopNeuralTTS = () => {
  if (currentActiveAudio) {
    try {
      currentActiveAudio.pause();
      currentActiveAudio.currentTime = 0;
    } catch (e) {
      console.warn("Error stopping active Audio element:", e);
    }
    currentActiveAudio = null;
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Error canceling SpeechSynthesis:", e);
    }
  }
  window.currentSpokenWord = "";
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  window.currentVisemeId = 0;
  window.currentSpokenWord = "";
  window.currentAudioAnalyser = null;
};

/**
 * Main Neural Speech & Viseme function
 */
export const speakWithNeuralTTS = async ({
  text,
  gender = "female",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
}) => {
  stopNeuralTTS();

  const sanitizedText = sanitizeTextForSpeech(text);
  if (!sanitizedText) return;

  const azureKey = import.meta.env?.VITE_AZURE_SPEECH_KEY || window?.AZURE_SPEECH_KEY;
  const azureRegion = import.meta.env?.VITE_AZURE_SPEECH_REGION || window?.AZURE_SPEECH_REGION || "eastus";

  // If Azure Speech API Key is provided, use Azure REST/SSML API
  if (azureKey) {
    try {
      const voiceName = gender === "male" ? "en-US-GuyNeural" : "en-US-JennyNeural";
      const ssml = `<speak version='1.0' xml:lang='en-US'><voice name='${voiceName}'>${sanitizedText}</voice></speak>`;

      const response = await fetch(
        `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
          },
          body: ssml,
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentActiveAudio = audio;

        audio.onplay = () => {
          window.currentSpeakingText = sanitizedText;
          onStart();
        };

        audio.onended = () => {
          window.currentSpokenWord = "";
          window.currentVisemeId = 0;
          onEnd();
        };

        audio.onerror = (e) => {
          console.warn("Azure audio playback error, falling back to Web Audio API analyzer", e);
          playFreeTTS(sanitizedText, gender, onStart, onEnd, onError);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Azure Neural Speech request failed, falling back to Web Audio API analyzer:", err);
    }
  }

  // Fallback to Free TTS with Web Audio Frequency Analysis
  playFreeTTS(sanitizedText, gender, onStart, onEnd, onError);
};

const fallbackWebSpeech = ({ sanitizedText, gender, onStart, onEnd, onError }) => {
  if (!("speechSynthesis" in window)) {
    onError("SpeechSynthesis not available");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(sanitizedText);
  utterance.rate = 1.0;
  utterance.pitch = gender === "female" ? 1.05 : 0.95;

  const availableVoices = window.speechSynthesis.getVoices();
  let selectedVoice = null;

  if (gender === "male") {
    selectedVoice =
      // 1. Highest Priority: Free Azure Male Natural Neural Voices
      availableVoices.find(
        (v) =>
          v.name.includes("Guy") ||
          v.name.includes("Christopher") ||
          v.name.includes("Steffan") ||
          v.name.includes("Prabhat") ||
          (v.name.includes("Natural") && (v.name.includes("Male") || v.name.includes("Guy"))) ||
          (v.name.includes("Online") && (v.name.includes("Male") || v.name.includes("Guy")))
      ) ||
      // 2. High Priority: Any Natural / Online Male Neural Voice
      availableVoices.find(
        (v) =>
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural")) &&
          !v.name.includes("Jenny") &&
          !v.name.includes("Aria") &&
          !v.name.includes("Zira") &&
          !v.name.includes("Female")
      ) ||
      // 3. Fallback System Male Voices
      availableVoices.find(
        (v) =>
          v.name.includes("David") ||
          v.name.includes("Mark") ||
          v.name.includes("Google US English") ||
          v.name.toLowerCase().includes("male")
      ) ||
      availableVoices.find(
        (v) => v.lang.startsWith("en") && !v.name.includes("Zira") && !v.name.includes("Samantha")
      );
  } else {
    selectedVoice =
      // 1. Highest Priority: Free Azure Female Natural Neural Voices
      availableVoices.find(
        (v) =>
          v.name.includes("Jenny") ||
          v.name.includes("Aria") ||
          v.name.includes("Ana") ||
          v.name.includes("Neerja") ||
          (v.name.includes("Natural") && (v.name.includes("Female") || v.name.includes("Jenny"))) ||
          (v.name.includes("Online") && (v.name.includes("Female") || v.name.includes("Jenny")))
      ) ||
      // 2. High Priority: Any Natural / Online Female Neural Voice
      availableVoices.find(
        (v) =>
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural")) &&
          !v.name.includes("Guy") &&
          !v.name.includes("David") &&
          !v.name.includes("Mark")
      ) ||
      // 3. Fallback System Female Voices
      availableVoices.find(
        (v) =>
          v.name.includes("Zira") ||
          v.name.includes("Female") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          v.name.includes("Google UK English Female")
      ) ||
      availableVoices.find(
        (v) => v.lang.startsWith("en") && !v.name.includes("David") && !v.name.includes("Mark")
      );
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    window.currentSpeakingText = sanitizedText;
    window.currentSpokenWord = "";
    onStart();
  };

  utterance.onboundary = (event) => {
    if (event.name === "word") {
      const word = sanitizedText.slice(event.charIndex, event.charIndex + (event.charLength || 5));
      window.currentSpokenWord = word;
    }
  };

  utterance.onend = () => {
    window.currentSpokenWord = "";
    onEnd();
  };

  utterance.onerror = (e) => {
    console.error("SpeechSynthesis error:", e);
    window.currentSpokenWord = "";
    onError(e);
  };

  window.speechSynthesis.speak(utterance);
};
