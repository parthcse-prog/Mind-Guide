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

  // High-precision word-by-word phoneme & syllabic lip-sync animation loop
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    morphMeshesRef.current.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      if (!dict || !infl) return;

      if (isSpeaking) {
        const word = (window.currentSpokenWord || "").toLowerCase().trim();
        const pulse = (Math.sin(elapsed * 26) + 1) / 2;
        const openPulse = (Math.sin(elapsed * 18) + 1) / 2;

        let targetAA = 0, targetE = 0, targetI = 0, targetO = 0, targetU = 0;
        let targetPP = 0, targetFF = 0, targetTH = 0, targetJaw = 0;

        if (word.length > 0) {
          // Detect active phoneme groups
          const hasA = /[aáàâä]/.test(word);
          const hasE = /[eéèêë]/.test(word);
          const hasI = /[iíìîïy]/.test(word);
          const hasO = /[oóòôö]/.test(word);
          const hasU = /[uúùûüw]/.test(word);
          const hasPBM = /[pbm]/.test(word);
          const hasFV = /[fv]/.test(word);
          const hasTH = /th/.test(word);

          if (hasA) {
            targetAA = 0.85 * pulse;
            targetJaw = 0.7 * openPulse;
          }
          if (hasE) {
            targetE = 0.75 * pulse;
            targetJaw = Math.max(targetJaw, 0.35 * openPulse);
          }
          if (hasI) {
            targetI = 0.75 * pulse;
            targetJaw = Math.max(targetJaw, 0.3 * openPulse);
          }
          if (hasO) {
            targetO = 0.9 * pulse;
            targetJaw = Math.max(targetJaw, 0.5 * openPulse);
          }
          if (hasU) {
            targetU = 0.85 * pulse;
            targetJaw = Math.max(targetJaw, 0.35 * openPulse);
          }

          if (hasPBM) {
            targetPP = 0.8;
            targetJaw *= 0.1; // Lip closure
          }
          if (hasFV) {
            targetFF = 0.75;
          }
          if (hasTH) {
            targetTH = 0.7;
          }

          // Dynamic vocal fallback for words without explicit vowels
          if (!hasA && !hasE && !hasI && !hasO && !hasU && !hasPBM) {
            targetAA = 0.5 * pulse;
            targetJaw = 0.4 * openPulse;
          }
        } else {
          // Gentle ambient vocalization pulse during speech pauses
          targetAA = 0.3 * pulse;
          targetJaw = 0.2 * openPulse;
        }

        // Smooth responsive interpolation
        const lerp = (curr, target) => curr + (target - curr) * 0.45;

        if (dict["viseme_aa"] !== undefined) infl[dict["viseme_aa"]] = lerp(infl[dict["viseme_aa"]], targetAA);
        if (dict["viseme_E"] !== undefined) infl[dict["viseme_E"]] = lerp(infl[dict["viseme_E"]], targetE);
        if (dict["viseme_I"] !== undefined) infl[dict["viseme_I"]] = lerp(infl[dict["viseme_I"]], targetI);
        if (dict["viseme_O"] !== undefined) infl[dict["viseme_O"]] = lerp(infl[dict["viseme_O"]], targetO);
        if (dict["viseme_U"] !== undefined) infl[dict["viseme_U"]] = lerp(infl[dict["viseme_U"]], targetU);
        if (dict["viseme_PP"] !== undefined) infl[dict["viseme_PP"]] = lerp(infl[dict["viseme_PP"]], targetPP);
        if (dict["viseme_FF"] !== undefined) infl[dict["viseme_FF"]] = lerp(infl[dict["viseme_FF"]], targetFF);
        if (dict["viseme_TH"] !== undefined) infl[dict["viseme_TH"]] = lerp(infl[dict["viseme_TH"]], targetTH);
        if (dict["jawOpen"] !== undefined) infl[dict["jawOpen"]] = lerp(infl[dict["jawOpen"]], targetJaw);
      } else {
        // Reset all visemes smoothly when silent
        Object.keys(dict).forEach((key) => {
          if (key.startsWith("viseme_") || key === "jawOpen") {
            const idx = dict[key];
            infl[idx] += (0 - infl[idx]) * 0.35;
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



