import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import avatarModelPath from "../assets/models/avatar.glb";
import animationsPath from "../assets/models/animations.glb";

const CharacterModel = ({ isSpeaking, loading }) => {
  const group = useRef();
  const { scene } = useGLTF(avatarModelPath);
  const { animations } = useGLTF(animationsPath);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    let currentAnim = "Idle";

    if (loading) {
      // While thinking... play ThoughtfulHeadShake animation
      currentAnim = actions["ThoughtfulHeadShake"] ? "ThoughtfulHeadShake" : "Idle";
    } else if (isSpeaking) {
      // When thinking finishes & response is being shown/spoken:
      // Cycle through active gestures (TalkingOne, TalkingTwo, TalkingThree, DismissingGesture, Surprised)
      const activeGestures = [
        "TalkingOne",
        "TalkingTwo",
        "TalkingThree",
        "DismissingGesture",
      ].filter((name) => actions[name]);

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

  return (
    <group ref={group} position={[0, -0.9, 0]} dispose={null}>
      <primitive object={scene} scale={0.85} />
    </group>
  );
};

// Preload models for seamless rendering
useGLTF.preload(avatarModelPath);
useGLTF.preload(animationsPath);

const AssistantAvatar = ({ size = "w-full h-full", isSpeaking = false, loading = false }) => {
  return (
    <div className={`${size} relative overflow-hidden bg-transparent flex items-center justify-center`}>
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <directionalLight position={[-5, 3, -2]} intensity={0.8} />
        <Suspense fallback={null}>
          <CharacterModel isSpeaking={isSpeaking} loading={loading} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default AssistantAvatar;



