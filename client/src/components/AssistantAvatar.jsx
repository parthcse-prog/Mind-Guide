import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import robotModelPath from "../assets/timy_robot.glb";

const RobotModel = () => {
  const { scene } = useGLTF(robotModelPath);

  return (
    <primitive
      object={scene}
      scale={2.1}
      position={[0, -1.25, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

const AssistantAvatar = ({ size = "w-full h-full" }) => {
  return (
    <div className={`${size} relative overflow-hidden bg-transparent flex items-center justify-center`}>
      <Canvas
        camera={{ position: [0, 0.4, 2.2], fov: 40 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <directionalLight position={[-5, 3, -2]} intensity={0.8} />
        <Suspense fallback={null}>
          <RobotModel />
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


