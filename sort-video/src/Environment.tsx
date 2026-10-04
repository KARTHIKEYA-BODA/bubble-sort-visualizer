/// <reference types="@react-three/fiber" />

import React from "react";
import * as THREE from "three";

// Fixed seed random generator for deterministic snow particles
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const SNOWFLAKE_COUNT = 150;
const SNOW_BOUNDS = {
  minX: -8,
  maxX: 8,
  minY: -0.5,
  maxY: 7.5,
  minZ: -4,
  maxZ: 4.5,
};

const SNOWFLAKES = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
  x: SNOW_BOUNDS.minX + pseudoRandom(i * 1.1) * (SNOW_BOUNDS.maxX - SNOW_BOUNDS.minX),
  startY: SNOW_BOUNDS.minY + pseudoRandom(i * 2.3) * (SNOW_BOUNDS.maxY - SNOW_BOUNDS.minY),
  z: SNOW_BOUNDS.minZ + pseudoRandom(i * 3.7) * (SNOW_BOUNDS.maxZ - SNOW_BOUNDS.minZ),
  speed: 0.035 + pseudoRandom(i * 4.9) * 0.045,
  wobbleSpeed: 0.03 + pseudoRandom(i * 5.2) * 0.04,
  wobbleAmp: 0.15 + pseudoRandom(i * 6.1) * 0.25,
  radius: 0.03 + pseudoRandom(i * 7.8) * 0.04,
  seed: i,
}));

export const SnowParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const ySpan = SNOW_BOUNDS.maxY - SNOW_BOUNDS.minY;

  return (
    <group>
      {SNOWFLAKES.map((flake, i) => {
        // Continuous looping downward drift
        const fallDist = frame * flake.speed;
        const currentY =
          SNOW_BOUNDS.maxY -
          ((flake.startY + fallDist - SNOW_BOUNDS.minY) % ySpan);

        const currentX =
          flake.x + Math.sin(frame * flake.wobbleSpeed + flake.seed) * flake.wobbleAmp;

        return (
          <mesh key={i} position={[currentX, currentY, flake.z]}>
            <sphereGeometry args={[flake.radius, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
};

// Snow-capped Pine Tree
export const SnowPineTree: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Wooden Trunk */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.9, 10]} />
        <meshStandardMaterial color="#4a2e1b" roughness={0.9} />
      </mesh>

      {/* Tier 1 (Bottom) */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <coneGeometry args={[1.05, 1.3, 8]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
      {/* Snow cap Tier 1 */}
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[0.92, 0.65, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Tier 2 (Middle) */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <coneGeometry args={[0.82, 1.2, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Snow cap Tier 2 */}
      <mesh position={[0, 2.22, 0]}>
        <coneGeometry args={[0.72, 0.58, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Tier 3 (Top) */}
      <mesh position={[0, 2.75, 0]} castShadow>
        <coneGeometry args={[0.55, 1.0, 8]} />
        <meshStandardMaterial color="#3f4a5c" roughness={0.8} />
      </mesh>
      {/* Snow cap Tier 3 */}
      <mesh position={[0, 2.9, 0]}>
        <coneGeometry args={[0.45, 0.55, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Cozy Winter Igloo
export const CozyIgloo: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main Dome */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Entrance Arch / Tunnel */}
      <mesh position={[0, 0.45, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, 1.1]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* Entrance Tunnel Top Curvature */}
      <mesh
        position={[0, 0.9, 1.5]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.55, 0.55, 1.1]}
      >
        <cylinderGeometry args={[1, 1, 1, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* Warm Golden Emissive Light Portal inside the entrance */}
      <mesh position={[0, 0.38, 2.06]}>
        <planeGeometry args={[0.7, 0.72]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={2.2}
          roughness={0.2}
        />
      </mesh>
      {/* Pointlight simulating warm lantern inside igloo */}
      <pointLight
        position={[0, 0.5, 2.3]}
        color="#fbbf24"
        intensity={1.8}
        distance={4.5}
      />
    </group>
  );
};

// Detailed Snowman
export const DetailedSnowman: React.FC<{
  position: [number, number, number];
}> = ({ position }) => {
  return (
    <group position={position}>
      {/* Bottom snowball */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.52, 24, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Middle snowball */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Coal chest buttons */}
      {[0.08, -0.08].map((yOff, i) => (
        <mesh key={i} position={[0, 1.25 + yOff, 0.36]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
      ))}

      {/* Stick arms */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.45, 1.32, 0]}
          rotation={[0, 0, side * 0.45]}
        >
          <cylinderGeometry args={[0.02, 0.025, 0.5, 8]} />
          <meshStandardMaterial color="#4a2e1b" roughness={0.9} />
        </mesh>
      ))}

      {/* Head */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <sphereGeometry args={[0.27, 24, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Carrot Nose */}
      <mesh position={[0, 1.82, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.065, 0.24, 12]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
      </mesh>

      {/* Coal Eyes */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 1.9, 0.24]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
      ))}

      {/* Red Scarf */}
      <mesh position={[0, 1.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.07, 12, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.7} />
      </mesh>

      {/* Black Top Hat */}
      {/* Hat brim */}
      <mesh position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Hat crown */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.38, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Hat ribbon band */}
      <mesh position={[0, 2.11, 0]}>
        <cylinderGeometry args={[0.245, 0.245, 0.07, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Slot Pedestals on the Ice Platform
export const SlotPedestals: React.FC<{
  slotCount: number;
  slotX: (i: number) => number;
  comparedSlots?: [number, number];
  sortedIndices: number[];
  time: number;
}> = ({ slotCount, slotX, comparedSlots, sortedIndices, time }) => {
  return (
    <group position={[0, 0.03, 0.15]}>
      {Array.from({ length: slotCount }, (_, i) => {
        const x = slotX(i);
        const isCompared = comparedSlots?.includes(i);
        const isSorted = sortedIndices.includes(i);

        let color = "#93c5fd"; // cool ice blue
        let emissive = "#3b82f6";
        let emissiveIntensity = 0.3;

        if (isCompared) {
          color = "#fef08a";
          emissive = "#f59e0b";
          emissiveIntensity = 1.0 + 0.4 * Math.sin(time * 8);
        } else if (isSorted) {
          color = "#86efac";
          emissive = "#22c55e";
          emissiveIntensity = 0.8 + 0.2 * Math.sin(time * 4);
        }

        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Base Ring Marker */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.38, 0.44, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Subtle inner frost disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.37, 32]} />
              <meshStandardMaterial
                color="#e0f2fe"
                roughness={0.2}
                metalness={0.1}
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Full Winter Environment Component
export const WinterEnvironment: React.FC<{
  frame: number;
  slotCount: number;
  slotX: (i: number) => number;
  comparedSlots?: [number, number];
  sortedIndices: number[];
}> = ({ frame, slotCount, slotX, comparedSlots, sortedIndices }) => {
  const time = frame / 30;

  return (
    <>
      {/* Lighting Setup */}
      {/* 1. Cool ambient light */}
      <ambientLight color="#c7d2fe" intensity={0.75} />

      {/* 2. Main Key Sun light */}
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.45}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* 3. Rim / Backlight for silhouettes */}
      <directionalLight
        position={[-6, 6, -6]}
        intensity={0.75}
        color="#818cf8"
      />

      {/* Falling Snow System */}
      <SnowParticles frame={frame} />

      {/* Distant Snowy Hills for atmospheric depth */}
      <mesh position={[0, -14.2, -8.5]}>
        <sphereGeometry args={[14.5, 36, 36]} />
        <meshStandardMaterial color="#6366f1" roughness={0.9} />
      </mesh>
      <mesh position={[-6, -11.5, -9.5]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.9} />
      </mesh>
      <mesh position={[6, -12, -9.5]}>
        <sphereGeometry args={[12.5, 32, 32]} />
        <meshStandardMaterial color="#581c87" roughness={0.9} />
      </mesh>

      {/* Surrounding & Foreground Soft Snowy Ground Plane */}
      <mesh
        position={[0, -0.22, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[32, 28]} />
        <meshStandardMaterial
          color="#c5d2ee"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* Main Frosted Ice Platform */}
      <mesh position={[0, -0.14, 0.25]} receiveShadow>
        <boxGeometry args={[9.8, 0.3, 3.2]} />
        <meshStandardMaterial
          color="#dbeafe"
          roughness={0.16}
          metalness={0.15}
        />
      </mesh>
      {/* Ice Slab Beveled Base */}
      <mesh position={[0, -0.26, 0.25]}>
        <boxGeometry args={[10.1, 0.1, 3.5]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.35} />
      </mesh>

      {/* Slot Pedestals on Ice */}
      <SlotPedestals
        slotCount={slotCount}
        slotX={slotX}
        comparedSlots={comparedSlots}
        sortedIndices={sortedIndices}
        time={time}
      />

      {/* Scenic Props */}
      <SnowPineTree position={[-4.7, 0, -5.2]} scale={1.25} />
      <SnowPineTree position={[-2.4, 0, -6.6]} scale={0.95} />
      <SnowPineTree position={[2.2, 0, -6.3]} scale={1.05} />
      <SnowPineTree position={[5.4, 0, -5.4]} scale={1.2} />

      <CozyIgloo position={[-4.3, 0, -2.5]} />
      <DetailedSnowman position={[4.8, 0, -2.1]} />
    </>
  );
};
