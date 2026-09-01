import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import timyRobotPath from "../assets/timy_robot.glb";
import femaleVroidPath from "../assets/NewCharacters/avatars/vroid.glb";
import femaleMpfbPath from "../assets/NewCharacters/avatars/mpfb.glb";
import femaleBrunetteTPath from "../assets/NewCharacters/avatars/brunette-t.glb";
import maleAvaturnPath from "../assets/NewCharacters/avatars/avaturn.glb";
import maleAvatarPath from "../assets/models/avatar.glb";
import maleSdkPath from "../assets/NewCharacters/avatars/avatarsdk.glb";
import model1Path from "../assets/Opensourcemodel/Model 1.glb";
import model2Path from "../assets/Opensourcemodel/Model 2.glb";
import animationsPath from "../assets/models/animations.glb";
import { AZURE_VISEME_MAP } from "../services/azureSpeechService";

// 7 Distinct Counselors: 3 Female, 3 Male, 1 Initial Robot Avatar
export const COUNSELOR_CONFIGS = {
  "academic counselor": {
    model: model1Path,
    gender: "male",
    name: "Dr. Alex",
    title: "Academic Counselor",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "career counselor": {
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Career Counselor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
  "personal counselor": {
    model: model2Path,
    gender: "male",
    name: "Ethan Rostova",
    title: "Personal Counselor",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "financial counselor": {
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Financial Counselor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
  "health and wellness counselor": {
    model: femaleBrunetteTPath,
    gender: "female",
    name: "Maya Lin",
    title: "Health & Wellness Counselor",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "student life counselor": {
    model: maleSdkPath,
    gender: "male",
    name: "David Miller",
    title: "Student Life Counselor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
  "emotional support counselor": {
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Emotional Support Counselor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
};

// Error boundary to prevent WebGL/Three.js errors from causing a white screen crash
class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Avatar 3D WebGL render error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900/30 to-purple-900/30 rounded-3xl p-6 text-center backdrop-blur-md border border-white/20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mb-3 animate-pulse">
            <span className="material-symbols-outlined text-white text-4xl">person</span>
          </div>
          <span className="text-sm font-semibold text-white/90">
            {this.props.counselorConfig?.name || "Counselor Avatar"}
          </span>
          <span className="text-xs text-white/60 mt-1">2D Counselor Mode</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const CharacterModel = ({ config, isSpeaking, loading }) => {
  const group = useRef();
  const avatarPath = config.model;

  const { scene } = useGLTF(avatarPath);
  const { animations } = useGLTF(animationsPath);
  const { actions } = useAnimations(animations, scene);
  const meshesRef = useRef({ mouthMeshes: [], eyeMeshes: [] });

  // Separate mouth/head meshes from eyeball meshes to prevent eye distortion
  useEffect(() => {
    const mouthMeshes = [];
    const eyeMeshes = [];

    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        const name = child.name.toLowerCase();
        if (name.includes("eye") && !name.includes("head") && !name.includes("face")) {
          eyeMeshes.push(child);
        } else {
          mouthMeshes.push(child);
        }
      }
    });

    meshesRef.current = { mouthMeshes, eyeMeshes };
  }, [scene]);

  // Handle body animations (Gestures / Idle / Thinking)
  useEffect(() => {
    if (!actions) return;
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

  // High-precision viseme lip-sync animation loop (commit 5c9e9918)
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const { mouthMeshes, eyeMeshes } = meshesRef.current;

    const getMorphIdx = (dict, keys) => {
      for (let i = 0; i < keys.length; i++) {
        if (dict[keys[i]] !== undefined) return dict[keys[i]];
      }
      return undefined;
    };

    if (mouthMeshes) {
      mouthMeshes.forEach((mesh) => {
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
              targetJaw *= 0.1;
            }
            if (hasFV) {
              targetFF = 0.75;
            }
            if (hasTH) {
              targetTH = 0.7;
            }

            if (!hasA && !hasE && !hasI && !hasO && !hasU && !hasPBM) {
              targetAA = 0.5 * pulse;
              targetJaw = 0.4 * openPulse;
            }
          } else {
            targetAA = 0.3 * pulse;
            targetJaw = 0.2 * openPulse;
          }

          const lerp = (curr, target) => curr + (target - curr) * 0.45;

          const idxAA = getMorphIdx(dict, ["viseme_aa", "vowel_a", "A01", "Fcl_MTH_A"]);
          const idxE = getMorphIdx(dict, ["viseme_E", "vowel_e", "A02", "Fcl_MTH_E"]);
          const idxI = getMorphIdx(dict, ["viseme_I", "vowel_i", "A03", "Fcl_MTH_I"]);
          const idxO = getMorphIdx(dict, ["viseme_O", "vowel_o", "A04", "Fcl_MTH_O"]);
          const idxU = getMorphIdx(dict, ["viseme_U", "vowel_u", "A05", "Fcl_MTH_U"]);
          const idxPP = getMorphIdx(dict, ["viseme_PP", "mouthClose"]);
          const idxFF = getMorphIdx(dict, ["viseme_FF", "mouthFunnel"]);
          const idxTH = getMorphIdx(dict, ["viseme_TH"]);
          const idxJaw = getMorphIdx(dict, ["jawOpen", "mouthOpen", "jaw_open", "MouthOpen"]);

          if (idxAA !== undefined) infl[idxAA] = lerp(infl[idxAA], targetAA);
          if (idxE !== undefined) infl[idxE] = lerp(infl[idxE], targetE);
          if (idxI !== undefined) infl[idxI] = lerp(infl[idxI], targetI);
          if (idxO !== undefined) infl[idxO] = lerp(infl[idxO], targetO);
          if (idxU !== undefined) infl[idxU] = lerp(infl[idxU], targetU);
          if (idxPP !== undefined) infl[idxPP] = lerp(infl[idxPP], targetPP);
          if (idxFF !== undefined) infl[idxFF] = lerp(infl[idxFF], targetFF);
          if (idxTH !== undefined) infl[idxTH] = lerp(infl[idxTH], targetTH);
          if (idxJaw !== undefined) infl[idxJaw] = lerp(infl[idxJaw], targetJaw);
        } else {
          Object.keys(dict).forEach((key) => {
            if (key.startsWith("viseme_") || key === "jawOpen" || key === "mouthOpen") {
              const idx = dict[key];
              infl[idx] += (0 - infl[idx]) * 0.35;
            }
          });
        }
      });
    }

    // Natural eye blinking applied strictly to eye meshes without eyeball distortion
    if (eyeMeshes) {
      eyeMeshes.forEach((mesh) => {
        const dict = mesh.morphTargetDictionary;
        const infl = mesh.morphTargetInfluences;
        if (!dict || !infl) return;

        if (dict["eyeBlinkLeft"] !== undefined && dict["eyeBlinkRight"] !== undefined) {
          const blinkTime = elapsed % 4.0;
          const isBlinking = blinkTime < 0.12;
          const blinkVal = isBlinking ? Math.sin((blinkTime / 0.12) * Math.PI) : 0;
          infl[dict["eyeBlinkLeft"]] = Math.min(Math.max(blinkVal, 0), 1.0);
          infl[dict["eyeBlinkRight"]] = Math.min(Math.max(blinkVal, 0), 1.0);
        }
      });
    }
  });

  return (
    <group ref={group} position={config.position || [0, -2.1, 0]} dispose={null}>
      <primitive object={scene} scale={config.scale || 1.35} />
    </group>
  );
};

// Preload all 7 counselor avatar models
try {
  useGLTF.preload(femaleVroidPath);
  useGLTF.preload(maleAvaturnPath);
  useGLTF.preload(femaleMpfbPath);
  useGLTF.preload(maleAvatarPath);
  useGLTF.preload(femaleBrunetteTPath);
  useGLTF.preload(maleSdkPath);
  useGLTF.preload(timyRobotPath);
  useGLTF.preload(animationsPath);
} catch (e) {
  console.warn("Avatar model preload warning:", e);
}

const LoadingAvatarFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center text-white/70">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
    <span className="text-xs font-medium">Loading 3D Counselor Avatar...</span>
  </div>
);

const AssistantAvatar = ({
  size = "w-full h-full",
  isSpeaking = false,
  loading = false,
  counselorType = "academic counselor",
}) => {
  const normType = (counselorType || "").toLowerCase().trim();
  const config = COUNSELOR_CONFIGS[normType] || COUNSELOR_CONFIGS["academic counselor"];

  return (
    <div className={`${size} relative overflow-hidden bg-transparent flex items-center justify-center`}>
      <Suspense fallback={<LoadingAvatarFallback />}>
        <AvatarErrorBoundary counselorConfig={config}>
          <Canvas
            camera={{ position: [0, 0, 1.95], fov: 40 }}
            style={{ width: "100%", height: "100%" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <ambientLight intensity={1.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.8} />
            <directionalLight position={[-5, 3, -2]} intensity={0.8} />
            <Suspense fallback={null}>
              <CharacterModel
                key={normType}
                config={config}
                isSpeaking={isSpeaking}
                loading={loading}
              />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              target={[0, 0, 0]}
              autoRotate={false}
            />
          </Canvas>
        </AvatarErrorBoundary>
      </Suspense>
    </div>
  );
};

export default AssistantAvatar;






