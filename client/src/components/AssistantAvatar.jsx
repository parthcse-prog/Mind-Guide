import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import avatarModelPath from "../assets/NewCharacters/avatars/brunette.glb";
import animationsPath from "../assets/models/animations.glb";

const VISEMES = ["viseme_aa", "viseme_E", "viseme_I", "viseme_O", "viseme_U", "jawOpen", "viseme_PP", "viseme_SS"];

const CharacterModel = ({ isSpeaking, loading }) => {
  const group = useRef();
  const { scene } = useGLTF(avatarModelPath);
  const { animations } = useGLTF(animationsPath);
  const { actions } = useAnimations(animations, scene);
  const morphMeshesRef = useRef([]);

  // Collect all meshes with morph target dictionary (visemes / face morphs)
  useEffect(() => {
    const morphMeshes = [];
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        morphMeshes.push(child);
      }
    });
    morphMeshesRef.current = morphMeshes;
  }, [scene]);

  // Handle body animations (Gestures / Idle / Thinking)
  useEffect(() => {
    let currentAnim = "Idle";

    if (loading) {
      currentAnim = actions["ThoughtfulHeadShake"] ? "ThoughtfulHeadShake" : "Idle";
    } else if (isSpeaking) {
      const activeGestures = ["TalkingOne", "TalkingTwo", "TalkingThree", "DismissingGesture"].filter(
        (name) => actions[name]
      );
      if (activeGestures.length > 0) {
        currentAnim = activeGestures[Math.floor(Math.random() * activeGestures.length)];
      } else {
        currentAnim = "Idle";
      }
    }

    if (!actions[currentAnim]) {
      currentAnim = actions["Idle"] ? "Idle" : Object.keys(actions)[0];
    }

    const actionToPlay = actions[currentAnim];
    if (actionToPlay) {
      actionToPlay.reset().fadeIn(0.3).play();
    }

    return () => {
      if (actionToPlay) {
        actionToPlay.fadeOut(0.3);
      }
    };
  }, [isSpeaking, loading, actions]);

  // Precise word-by-word phoneme-to-viseme lip-sync animation loop
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    morphMeshesRef.current.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      if (!dict || !infl) return;

      if (isSpeaking) {
        const word = (window.currentSpokenWord || "").toLowerCase();
        const vowels = word.match(/[aeiou]/g) || [];
        const lastVowel = vowels[vowels.length - 1] || "";

        // Base speech pulse
        const pulse = (Math.sin(elapsed * 24) + 1) / 2;

        // Phoneme-driven viseme mapping
        let targetAA = 0, targetE = 0, targetI = 0, targetO = 0, targetU = 0;
        let targetPP = 0, targetFF = 0, targetTH = 0, targetJaw = 0;

        if (lastVowel === "a") {
          targetAA = 0.8 * pulse;
          targetJaw = 0.6 * pulse;
        } else if (lastVowel === "e") {
          targetE = 0.7 * pulse;
        } else if (lastVowel === "i") {
          targetI = 0.7 * pulse;
        } else if (lastVowel === "o") {
          targetO = 0.85 * pulse;
          targetJaw = 0.4 * pulse;
        } else if (lastVowel === "u") {
          targetU = 0.8 * pulse;
        } else {
          // Default vocalization pulse if word has no explicit vowel
          targetAA = 0.4 * pulse;
          targetJaw = 0.3 * pulse;
        }

        // Bilabial consonants (P, B, M) -> close lips
        if (/[pbm]/.test(word)) {
          targetPP = 0.7;
          targetJaw *= 0.2;
        }
        // Labiodental consonants (F, V)
        if (/[fv]/.test(word)) {
          targetFF = 0.7;
        }

        // Smoothly interpolate influences to targets
        const lerp = (curr, target) => curr + (target - curr) * 0.45;

        if (dict["viseme_aa"] !== undefined) infl[dict["viseme_aa"]] = lerp(infl[dict["viseme_aa"]], targetAA);
        if (dict["viseme_E"] !== undefined) infl[dict["viseme_E"]] = lerp(infl[dict["viseme_E"]], targetE);
        if (dict["viseme_I"] !== undefined) infl[dict["viseme_I"]] = lerp(infl[dict["viseme_I"]], targetI);
        if (dict["viseme_O"] !== undefined) infl[dict["viseme_O"]] = lerp(infl[dict["viseme_O"]], targetO);
        if (dict["viseme_U"] !== undefined) infl[dict["viseme_U"]] = lerp(infl[dict["viseme_U"]], targetU);
        if (dict["viseme_PP"] !== undefined) infl[dict["viseme_PP"]] = lerp(infl[dict["viseme_PP"]], targetPP);
        if (dict["viseme_FF"] !== undefined) infl[dict["viseme_FF"]] = lerp(infl[dict["viseme_FF"]], targetFF);
        if (dict["jawOpen"] !== undefined) infl[dict["jawOpen"]] = lerp(infl[dict["jawOpen"]], targetJaw);
      } else {
        // Reset all visemes smoothly when silence/not speaking
        Object.keys(dict).forEach((key) => {
          if (key.startsWith("viseme_") || key === "jawOpen") {
            const idx = dict[key];
            infl[idx] += (0 - infl[idx]) * 0.3;
          }
        });
      }

      // Natural realistic eye blinking
      if (dict["eyeBlinkLeft"] !== undefined && dict["eyeBlinkRight"] !== undefined) {
        const blinkTime = elapsed % 3.8;
        const isBlinking = blinkTime < 0.14;
        const blinkVal = isBlinking ? Math.sin((blinkTime / 0.14) * Math.PI) : 0;
        infl[dict["eyeBlinkLeft"]] = blinkVal;
        infl[dict["eyeBlinkRight"]] = blinkVal;
      }
    });
  });

  return (
    <group ref={group} position={[0, -2.1, 0]} dispose={null}>
      <primitive object={scene} scale={1.35} />
    </group>
  );
};

// Preload assets for instant load
useGLTF.preload(avatarModelPath);
useGLTF.preload(animationsPath);

const AssistantAvatar = ({ size = "w-full h-full", isSpeaking = false, loading = false }) => {
  return (
    <div className={`${size} relative overflow-hidden bg-transparent flex items-center justify-center`}>
      <Canvas
        camera={{ position: [0, 0, 1.95], fov: 40 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <directionalLight position={[-5, 3, -2]} intensity={0.8} />
        <Suspense fallback={null}>
          <CharacterModel isSpeaking={isSpeaking} loading={loading} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          target={[0, 0, 0]}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default AssistantAvatar;



