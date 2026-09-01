export const playFreeTTS = async (text, gender, onStart, onEnd, onError) => {
  try {
    // We use the free Google Translate TTS endpoint as a reliable fallback that returns an actual audio file.
    // It has a 200 character limit, so we chunk the text by sentences/commas.
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Set up Web Audio API for frequency analysis
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5; // Smooth out the jaw movements
    
    // Export analyser globally so AssistantAvatar.jsx can read it in useFrame
    window.currentAudioAnalyser = analyser;
    window.currentAudioDataArray = new Uint8Array(analyser.frequencyBinCount);
    
    onStart();

    // Play chunks sequentially
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      
      const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(chunk.trim().substring(0, 200))}&tl=\${gender === 'male' ? 'en-gb' : 'en-us'}&client=tw-ob\`;
      
      await new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.crossOrigin = "anonymous";
        
        // Connect to AudioContext
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        window.currentActiveAudio = audio;

        audio.onended = () => {
          source.disconnect();
          resolve();
        };
        audio.onerror = (e) => reject(e);
        
        audio.play().catch(reject);
      });
    }

    // Cleanup after all chunks finish
    window.currentAudioAnalyser = null;
    window.currentAudioDataArray = null;
    onEnd();

  } catch (err) {
    console.error("Free TTS Error:", err);
    onError(err);
  }
};
