"use client";

import { Float, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

// Ідея сторінки в 3D: «бульбашка чату» → документ → вікно сайту → графік, скляні картки по дузі, ледь реагують на курсор.
// Вантажиться ліниво після першого рендеру (dynamic, ssr:false), тож не впливає на LCP. Reduced-motion — не рендеримо.
const CARDS: { pos: [number, number, number]; size: [number, number]; lime?: boolean }[] = [
  { pos: [-2.6, 0.9, -0.6], size: [1.5, 0.9] }, // чат
  { pos: [-0.9, -0.5, 0.2], size: [1.1, 1.45] }, // ТЗ
  { pos: [1.0, 0.65, -0.2], size: [1.8, 1.2], lime: true }, // сайт
  { pos: [2.7, -0.7, -0.8], size: [1.2, 0.85] }, // аналітика
];

function Cards() {
  const g = useRef<Group>(null);
  useFrame(({ pointer }, dt) => {
    if (!g.current) return;
    g.current.rotation.y += (pointer.x * 0.25 - g.current.rotation.y) * Math.min(1, dt * 2);
    g.current.rotation.x += (-pointer.y * 0.12 - g.current.rotation.x) * Math.min(1, dt * 2);
  });
  return (
    <group ref={g}>
      {CARDS.map(({ pos, size, lime }, i) => (
        <Float key={i} speed={1.2 + i * 0.2} rotationIntensity={0.35} floatIntensity={0.7}>
          <RoundedBox args={[size[0], size[1], 0.08]} radius={0.06} position={pos}>
            <meshPhysicalMaterial color={lime ? "#c3ff55" : "#1b2530"} roughness={0.25} metalness={0.1} clearcoat={1} transparent opacity={lime ? 0.92 : 0.7} emissive={lime ? "#7fb52a" : "#000000"} emissiveIntensity={0.35} />
          </RoundedBox>
          {/* «рядки тексту» на картці */}
          {[0.22, 0.02, -0.18].map((y, k) => (
            <mesh key={k} position={[pos[0] - size[0] * 0.12, pos[1] + y * size[1], pos[2] + 0.05]}>
              <planeGeometry args={[size[0] * (0.6 - k * 0.12), 0.05]} />
              <meshBasicMaterial color={lime ? "#080b0e" : "#c3ff55"} transparent opacity={lime ? 0.6 : 0.45} />
            </mesh>
          ))}
        </Float>
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#c3ff55" />
      <Cards />
    </Canvas>
  );
}
