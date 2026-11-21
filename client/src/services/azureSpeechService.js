// Microsoft Azure Neural Text-to-Speech & Viseme Audio Service + MIET Gateway Kokoro TTS & STT

export const AZURE_NEURAL_VOICES = {
  female: ["hi-IN-SwaraNeural", "en-IN-NeerjaNeural", "en-US-JennyNeural"],
  male: ["hi-IN-MadhurNeural", "en-IN-PrabhatNeural", "en-US-GuyNeural"],
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

// GLOBAL WEB AUDIO API (For real-time audio-reactive lip sync)
// Unlocked on the very first user interaction to bypass browser autoplay security
let globalAudioCtx = null;
let globalAnalyser = null;
let globalAudioEl = null;
let globalSourceNode = null;
let audioInitialized = false;

export const initGlobalAudio = () => {
  if (audioInitialized) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new AudioContextClass();
    globalAnalyser = globalAudioCtx.createAnalyser();
    globalAnalyser.fftSize = 256;
    globalAnalyser.smoothingTimeConstant = 0.5;

    globalAudioEl = new Audio();
    globalAudioEl.crossOrigin = "anonymous";
    
    globalSourceNode = globalAudioCtx.createMediaElementSource(globalAudioEl);
    globalSourceNode.connect(globalAnalyser);
    globalAnalyser.connect(globalAudioCtx.destination);

    window.globalAudioAnalyser = globalAnalyser;
    window.globalAudioDataArray = new Uint8Array(globalAnalyser.frequencyBinCount);
    
    audioInitialized = true;
  } catch (err) {
    console.error("Failed to initialize Global Audio Context", err);
  }
};

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initGlobalAudio();
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);
}

let currentActiveAudio = null;
let currentTTSId = 0; // Token to cancel queued sentences

export const stopNeuralTTS = () => {
  currentTTSId++; // Invalidates the current playback loop
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
  window.globalAudioActive = false;
  window.currentSpokenWord = "";
  window.currentVisemeId = 0;
  window.currentSpeakingText = "";
};

/**
 * Transcribe Audio with MIET Gateway STT
 * Supports Whisper for English, AI4Bharat IndicConformer for Hindi
 */
export const transcribeAudioWithGateway = async ({ audioBlob, language = "en" }) => {
  const token = import.meta.env?.VITE_OPENAI_API_KEY || window?.OPENAI_API_KEY || "dgx_942ea91f275263b6ee47220c55583ba3e9ca8fa9f7904833";
  const isHindi = language === "hi" || language.startsWith("hi");
  
  const url = isHindi
    ? "https://ai-services.mietjmu.in/gateway/voice/stt?backend=indic&language=hi"
    : "https://ai-services.mietjmu.in/gateway/voice/stt?language=auto&task=transcribe";

  const form = new FormData();
  form.append("audio_file", audioBlob, isHindi ? "recording.wav" : "recording.webm");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`STT request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data?.text ? data.text.trim() : "";
};

/**
 * Main Neural Speech & Viseme function
 */
export const speakWithNeuralTTS = async ({
  text,
  gender = "female",
  counselorName = "",
  language = "en",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
}) => {
  stopNeuralTTS();

  const sanitizedText = sanitizeTextForSpeech(text);
  if (!sanitizedText) return;

  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(sanitizedText);
  const targetLanguage = isHindi ? "hi" : "en";

  const azureKey = import.meta.env?.VITE_AZURE_SPEECH_KEY || window?.AZURE_SPEECH_KEY;
  const azureRegion = import.meta.env?.VITE_AZURE_SPEECH_REGION || window?.AZURE_SPEECH_REGION || "eastus";

  // If Azure Speech API Key is provided, use Azure REST/SSML API
  if (azureKey) {
    try {
      const voiceName = isHindi
        ? (gender === "male" ? "hi-IN-MadhurNeural" : "hi-IN-SwaraNeural")
        : (gender === "male" ? "en-US-GuyNeural" : "en-US-JennyNeural");

      const ssmlLang = isHindi ? "hi-IN" : "en-US";
      const ssml = `<speak version='1.0' xml:lang='${ssmlLang}'><voice name='${voiceName}'>${sanitizedText}</voice></speak>`;

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
          window.globalAudioActive = true;
          onStart();
        };

        audio.onended = () => {
          window.currentSpokenWord = "";
          window.currentVisemeId = 0;
          window.globalAudioActive = false;
          onEnd();
        };

        audio.onerror = (e) => {
          console.warn("Azure audio playback error, falling back to Kokoro TTS", e);
          window.globalAudioActive = false;
          playKokoroTTS({ sanitizedText, gender, counselorName, language: targetLanguage, onStart, onEnd, onError });
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Azure Neural Speech request failed, trying Kokoro TTS:", err);
    }
  }

  // Ultra-fast Edge-TTS voice synthesis (~0.5s latency, distinct voices)
  playEdgeTTS({ sanitizedText, gender, counselorName, language: targetLanguage, onStart, onEnd, onError });
};

/**
 * Play pre-cached demo audio with instant response & audio-reactive lip sync
 */
export const playPrecachedDemoAudio = async ({
  audioSrc,
  spokenText = "",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
}) => {
  stopNeuralTTS();
  const playId = currentTTSId;
  try {
    if (!audioInitialized || !globalAudioEl) {
      initGlobalAudio();
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    onStart();
    window.globalAudioActive = true;
    window.currentSpeakingText = spokenText;

    globalAudioEl.src = audioSrc;
    currentActiveAudio = globalAudioEl;

    await new Promise((resolve, reject) => {
      globalAudioEl.onended = () => resolve();
      globalAudioEl.onerror = (e) => reject(e);
      globalAudioEl.play().catch((err) => reject(err));
    });

    if (playId === currentTTSId) {
      window.globalAudioActive = false;
      window.currentSpokenWord = "";
      window.currentVisemeId = 0;
      onEnd();
    }
  } catch (err) {
    console.warn("Precached demo audio playback error:", err);
    window.globalAudioActive = false;
    onError(err);
  }
};

/**
 * Play speech using Edge-TTS proxy with distinct counselor voices
 */
export const playEdgeTTS = async ({
  sanitizedText,
  gender = "female",
  counselorName = "",
  language = "en",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
}) => {
  const playId = currentTTSId;
  try {
    const isHindi = language === "hi" || /[\u0900-\u097F]/.test(sanitizedText);
    const targetLanguage = isHindi ? "hi" : "en";

    const response = await fetch("http://localhost:3001/api/v1/voice/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: sanitizedText,
        language: targetLanguage,
        counselorName,
        gender,
      }),
    });

    if (!response.ok) {
      throw new Error(`Edge-TTS returned ${response.status}`);
    }

    if (playId !== currentTTSId) return;

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (!audioInitialized || !globalAudioEl) {
      initGlobalAudio();
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    onStart();
    window.globalAudioActive = true;
    window.currentSpeakingText = sanitizedText;

    globalAudioEl.src = audioUrl;
    currentActiveAudio = globalAudioEl;

    await new Promise((resolve, reject) => {
      globalAudioEl.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      globalAudioEl.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(e);
      };
      globalAudioEl.play().catch((err) => {
        URL.revokeObjectURL(audioUrl);
        reject(err);
      });
    });

    if (playId === currentTTSId) {
      window.globalAudioActive = false;
      window.currentSpokenWord = "";
      window.currentVisemeId = 0;
      onEnd();
    }
  } catch (err) {
    console.warn("Edge-TTS failed, falling back to browser speech:", err);
    window.globalAudioActive = false;
    fallbackWebSpeech({ sanitizedText, gender, counselorName, language, onStart, onEnd, onError });
  }
};

export const playKokoroTTS = playEdgeTTS;

const fallbackWebSpeech = ({ sanitizedText, gender, counselorName = "", language = "en", onStart, onEnd, onError }) => {
  if (!("speechSynthesis" in window)) {
    onError("SpeechSynthesis not available");
    return;
  }

  window.speechSynthesis.cancel();
  window.globalAudioActive = false;

  const utterance = new SpeechSynthesisUtterance(sanitizedText);
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(sanitizedText);
  utterance.lang = isHindi ? "hi-IN" : "en-US";
  utterance.rate = 1.0;
  utterance.pitch = gender === "female" ? 1.05 : 0.95;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (isHindi) {
      const hiVoice = voices.find(v => v.lang.startsWith("hi") || v.name.includes("Hindi") || v.name.includes("हिन्दी"));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith("en") && (gender === "female" ? v.name.includes("Female") || v.name.includes("Jenny") : v.name.includes("Male") || v.name.includes("Guy")));
      if (enVoice) utterance.voice = enVoice;
    }
  }

  utterance.onstart = () => {
    window.currentSpeakingText = sanitizedText;
    onStart();
  };

  utterance.onend = () => {
    window.currentSpokenWord = "";
    onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("SpeechSynthesis fallback error:", e);
    onError(e);
  };

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
};
