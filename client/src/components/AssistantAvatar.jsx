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

// Avatars for Mental Health, Relationships, Youth Problems & Life Guidance
export const COUNSELOR_CONFIGS = {
  "saarthi": {
    id: "saarthi",
    model: model1Path,
    gender: "male",
    name: "Dr. Alex (Saarthi)",
    title: "Chief Life & Youth Guide",
    position: [0, -2.1, 0],
    scale: 1.35,
    tagline: "Your compassionate companion for mental health, relationships & life",
    voice: "en-IN-PrabhatNeural",
  },
  "maya": {
    id: "maya",
    model: femaleBrunetteTPath,
    gender: "female",
    name: "Maya Lin",
    title: "Mental Health & Calm Guide",
    position: [0, -2.1, 0],
    scale: 1.35,
    tagline: "Stress, anxiety, emotional balance & inner calm",
    voice: "en-IN-NeerjaNeural",
  },
  "ethan": {
    id: "ethan",
    model: model2Path,
    gender: "male",
    name: "Ethan Rostova",
    title: "Relationships & Youth Confidant",
    position: [0, -2.1, 0],
    scale: 1.35,
    tagline: "Love, friendships, boundaries & youth dilemmas",
    voice: "en-US-DavisNeural",
  },
  "marcus": {
    id: "marcus",
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Confidence & Purpose Mentor",
    position: [0, -2.2, 0],
    scale: 1.4,
    tagline: "Overcoming self-doubt, ambition & finding your path",
    voice: "en-US-GuyNeural",
  },
  "luna": {
    id: "luna",
    model: femaleVroidPath,
    gender: "female",
    name: "Luna",
    title: "Empathy & Self-Discovery Soul",
    position: [0, -2.1, 0],
    scale: 1.35,
    tagline: "Loneliness, identity, healing & creative self-expression",
    voice: "en-US-JennyNeural",
  },
  "timy": {
    id: "timy",
    model: timyRobotPath,
    gender: "male",
    name: "Timy Robot",
    title: "Habit & Clear-Thinking Copilot",
    position: [0, -1.8, 0],
    scale: 1.25,
    tagline: "Breaking overthinking, building habits & practical clarity",
    voice: "en-US-TonyNeural",
  },
  // Backward compatibility mappings
  "alex": {
    id: "alex",
    model: model1Path,
    gender: "male",
    name: "Dr. Alex (Saarthi)",
    title: "Chief Life & Youth Guide",
    position: [0, -2.1, 0],
    scale: 1.35,
    tagline: "Your compassionate companion for mental health, relationships & life",
    voice: "en-IN-PrabhatNeural",
  },
  "academic counselor": {
    id: "saarthi",
    model: model1Path,
    gender: "male",
    name: "Dr. Alex (Saarthi)",
    title: "Chief Life & Youth Guide",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "career counselor": {
    id: "marcus",
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Confidence & Purpose Mentor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
  "personal counselor": {
    id: "ethan",
    model: model2Path,
    gender: "male",
    name: "Ethan Rostova",
    title: "Relationships & Youth Confidant",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "financial counselor": {
    id: "marcus",
    model: maleAvatarPath,
    gender: "male",
    name: "Marcus Cole",
    title: "Confidence & Purpose Mentor",
    position: [0, -2.2, 0],
    scale: 1.4,
  },
  "health and wellness counselor": {
    id: "maya",
    model: femaleBrunetteTPath,
    gender: "female",
    name: "Maya Lin",
    title: "Mental Health & Calm Guide",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "student life counselor": {
    id: "ethan",
    model: model2Path,
    gender: "male",
    name: "Ethan Rostova",
    title: "Relationships & Youth Confidant",
    position: [0, -2.1, 0],
    scale: 1.35,
  },
  "emotional support counselor": {
    id: "luna",
    model: femaleVroidPath,
    gender: "female",
    name: "Luna",
    title: "Empathy & Self-Discovery Soul",
    position: [0, -2.1, 0],
    scale: 1.35,
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a3b47]/80 rounded-3xl p-6 text-center backdrop-blur-md border border-white/20">
          <div className="w-20 h-20 rounded-full bg-[#002531] border border-[#acecdc]/30 flex items-center justify-center shadow-lg mb-3 motion-safe:animate-pulse">
            <span className="material-symbols-outlined text-[#acecdc] text-4xl">person</span>
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
      // User specifically requested to disable abrupt looping hand gestures 
      // and keep hands in a resting/clasped position. The natural Idle pose achieves this.
      currentAnim = "Idle";
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

  // High-precision viseme lip-sync & interactive gaze animation loop
  useFrame(({ clock, pointer, mouse }) => {
    const elapsed = clock.getElapsedTime();
    const ptrX = pointer?.x ?? mouse?.x ?? 0;
    const ptrY = pointer?.y ?? mouse?.y ?? 0;
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
          // REAL-TIME AUDIO REACTIVE LIP SYNC
          let targetJaw = 0;
          let targetO = 0;
          let targetE = 0;

          if (window.globalAudioAnalyser && window.globalAudioDataArray) {
            window.globalAudioAnalyser.getByteFrequencyData(window.globalAudioDataArray);
            
            let bass = 0;
            let treble = 0;
            const length = window.globalAudioDataArray.length;
            const half = Math.floor(length / 2);
            
            for (let i = 0; i < half; i++) {
              bass += window.globalAudioDataArray[i];
              treble += window.globalAudioDataArray[i + half];
            }
            
            bass = (bass / half) / 255.0; 
            treble = (treble / half) / 255.0;
            const volume = bass + treble;
            
            // Ethan and Dr. Alex need wider mouth movements due to their model mesh density
            const counselorName = config?.name || "";
            const isWideMouth = counselorName === "Ethan Rostova" || counselorName === "Dr. Alex";
            const jawMultiplier = isWideMouth ? 1.0 : 0.7;
            const jawMax = isWideMouth ? 0.65 : 0.4;
            
            targetJaw = Math.min(volume * jawMultiplier, jawMax); 
            
            // Relying strictly on raw FFT bass vs treble often just looks like a constant "O".
            // Instead, we use the real-time volume to drive the jaw perfectly in sync with the audio,
            // while smoothly cycling the O (pucker) and E (widen) shapes to simulate actual phonetic speech.
            const shapeCycle = Math.floor(elapsed * 6) % 3;
            targetO = shapeCycle === 0 ? targetJaw * 0.7 : 0; 
            targetE = shapeCycle === 1 ? targetJaw * 0.8 : 0; 
          }
          
          Object.keys(dict).forEach((key) => {
            const k = key.toLowerCase();
            const idx = dict[key];
            
            // Universal Jaw / A shape
            if (
              k.includes("jaw") || 
              k.includes("mouthopen") || 
              k.includes("viseme_aa") || 
              k.includes("vowel_a") || 
              k === "a01" ||
              k === "fcl_mth_a"
            ) {
              infl[idx] += (Math.min(targetJaw, 1.0) - infl[idx]) * 0.45;
            }
            // Universal O shape
            else if (k.includes("viseme_o") || k.includes("vowel_o") || k === "a04" || k === "fcl_mth_o") {
              infl[idx] += (Math.min(targetO, 1.0) - infl[idx]) * 0.45;
            }
            // Universal E shape
            else if (k.includes("viseme_e") || k.includes("vowel_e") || k === "a02" || k === "fcl_mth_e") {
              infl[idx] += (Math.min(targetE, 1.0) - infl[idx]) * 0.45;
            }
          });
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

    // 1. Interactive Cursor & Gaze Tracking: Eyes/Head follow the student's mouse smoothly
    const head = scene.getObjectByName("Head") || scene.getObjectByName("mixamorigHead") || scene.getObjectByName("J_Bip_C_Head");
    const neck = scene.getObjectByName("Neck") || scene.getObjectByName("mixamorigNeck") || scene.getObjectByName("J_Bip_C_Neck");
    
    // Smooth target gaze angles (safely clamped within natural human neck range)
    const targetHeadY = Math.max(Math.min(ptrX * 0.28, 0.32), -0.32);
    const targetHeadX = Math.max(Math.min(-ptrY * 0.22, 0.24), -0.24);

    if (head) {
      head.rotation.y += (targetHeadY - head.rotation.y) * 0.08;
      head.rotation.x += (targetHeadX - head.rotation.x) * 0.08;

      if (isSpeaking) {
        // Conversational empathetic nod (1-2 degrees) synced to voice cadence
        const speechNod = Math.sin(elapsed * 2.2) * 0.022;
        head.rotation.x += speechNod;
      }
    }

    if (neck) {
      neck.rotation.y += (targetHeadY * 0.35 - neck.rotation.y) * 0.08;
      neck.rotation.x += (targetHeadX * 0.35 - neck.rotation.x) * 0.08;
    }

    // 2. Ambient Spine Breathing (Natural respiratory life so models never feel frozen)
    const spine = scene.getObjectByName("Spine") || scene.getObjectByName("mixamorigSpine") || scene.getObjectByName("J_Bip_C_Spine");
    if (spine) {
      const breathCycle = Math.sin(elapsed * 1.5) * 0.012;
      spine.rotation.x = breathCycle;
    }

    // 3. Hands & Arms: Anchored strictly at waist level (hands NEVER go up)
    const rightArm = scene.getObjectByName("RightArm") || scene.getObjectByName("mixamorigRightArm");
    const rightForeArm = scene.getObjectByName("RightForeArm") || scene.getObjectByName("mixamorigRightForeArm");
    const leftArm = scene.getObjectByName("LeftArm") || scene.getObjectByName("mixamorigLeftArm");
    const leftForeArm = scene.getObjectByName("LeftForeArm") || scene.getObjectByName("mixamorigLeftForeArm");
    const rightHand = scene.getObjectByName("RightHand") || scene.getObjectByName("mixamorigRightHand");
    const leftHand = scene.getObjectByName("LeftHand") || scene.getObjectByName("mixamorigLeftHand");

    const vroidRightArm = scene.getObjectByName("J_Bip_R_UpperArm");
    const vroidRightForeArm = scene.getObjectByName("J_Bip_R_LowerArm");
    const vroidLeftArm = scene.getObjectByName("J_Bip_L_UpperArm");
    const vroidLeftForeArm = scene.getObjectByName("J_Bip_L_LowerArm");
    const vroidRightHand = scene.getObjectByName("J_Bip_R_Hand");
    const vroidLeftHand = scene.getObjectByName("J_Bip_L_Hand");

    // Micro-cadence when speaking: hands stay strictly anchored down at waist level
    let armTwistR = -0.2;
    let armTwistL = 0.2;
    let foreArmBendR = -0.58;
    let foreArmBendL = 0.58;
    let handTiltR = 0;
    let handTiltL = 0;

    if (isSpeaking) {
      // Controlled, poised micro-articulation strictly at waist height (never raises hands up)
      const cadence = Math.sin(elapsed * 2.3) * 0.035;
      const wristSway = Math.cos(elapsed * 1.6) * 0.025;

      armTwistR = -0.2 + cadence * 0.2;
      armTwistL = 0.2 - cadence * 0.2;
      foreArmBendR = -0.58 + cadence * 0.4;
      foreArmBendL = 0.58 - cadence * 0.4;
      handTiltR = -0.04 + wristSway;
      handTiltL = 0.04 - wristSway;
    }

    // Apply to RPM / Mixamo rigged models
    if (rightArm && rightForeArm && leftArm && leftForeArm) {
      rightArm.rotation.y = armTwistR; 
      leftArm.rotation.y = armTwistL;
      rightForeArm.rotation.z = foreArmBendR;
      leftForeArm.rotation.z = foreArmBendL;

      if (rightHand && leftHand) {
        rightHand.rotation.z = handTiltR;
        leftHand.rotation.z = handTiltL;
      }
    }
    
    // Apply to VRoid rigged models
    if (vroidRightArm && vroidRightForeArm && vroidLeftArm && vroidLeftForeArm) {
      vroidRightArm.rotation.y = armTwistR;
      vroidLeftArm.rotation.y = armTwistL;
      vroidRightForeArm.rotation.y = foreArmBendR;
      vroidLeftForeArm.rotation.y = foreArmBendL;

      if (vroidRightHand && vroidLeftHand) {
        vroidRightHand.rotation.z = handTiltR;
        vroidLeftHand.rotation.z = handTiltL;
      }
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
  const [interactiveMsg, setInteractiveMsg] = React.useState(null);

  const handleAvatarClick = () => {
    setInteractiveMsg(`${config.name} is listening to you`);
    setTimeout(() => setInteractiveMsg(null), 2500);
  };

  return (
    <div 
      onClick={handleAvatarClick}
      title="Click to interact with 3D counselor"
      className={`${size} relative overflow-hidden bg-transparent flex items-center justify-center cursor-pointer select-none group`}
    >
      {/* Interactive Counselor Status Pill */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-teal-300 font-semibold flex items-center gap-1.5 border border-white/10 pointer-events-none transition-all shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"></span>
        <span className="truncate max-w-[180px]">{interactiveMsg || `${config.name} • Active Gaze`}</span>
      </div>

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






