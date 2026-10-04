/// <reference types="@react-three/fiber" />

import React from "react";
import * as THREE from "three";

const SCARF_COLORS = [
  "#e11d48", // red
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#ec4899", // pink
  "#f97316", // orange
  "#3b82f6", // blue
];

// Helper to create crisp high-contrast canvas texture for number badge
export const createNumberTexture = (val: number, isSorted: boolean): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 256, 256);

  // Outer border / rim
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.fillStyle = isSorted ? "#facc15" : "#38bdf8";
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Inner badge background
  ctx.beginPath();
  ctx.arc(128, 128, 98, 0, Math.PI * 2);
  ctx.fillStyle = isSorted ? "#1e293b" : "#0f172a";
  ctx.fill();

  // Number text
  ctx.fillStyle = isSorted ? "#fef08a" : "#ffffff";
  ctx.font = "900 110px 'Segoe UI', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillText(String(val), 128, 134);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Helper for checkmark badge texture
export const createCheckmarkTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 256, 256);

  // Golden circular badge with rich metallic gradient
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(100, 95, 10, 128, 128, 120);
  grad.addColorStop(0, "#fef9c3");
  grad.addColorStop(0.35, "#fde047");
  grad.addColorStop(0.75, "#eab308");
  grad.addColorStop(1, "#a16207");
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Bold white checkmark ✓ with drop shadow
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 135px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillText("✓", 128, 136);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export type PenguinProps = {
  value: number;
  normalizedValue: number;
  position: [number, number, number];
  rotation: [number, number, number];
  headRotation: [number, number, number];
  scale: [number, number, number];
  wingLeftRotation: [number, number, number];
  wingRightRotation: [number, number, number];
  isSorted: boolean;
  isCompared: boolean;
  isSwapping: boolean;
  time: number;
};

export const Penguin: React.FC<PenguinProps> = ({
  value,
  normalizedValue,
  position,
  rotation,
  headRotation,
  scale,
  wingLeftRotation,
  wingRightRotation,
  isSorted,
  isCompared,
  time,
}) => {
  // Value-based penguin size: smallest (0.60) to largest (1.00)
  const baseScale = 0.6 + 0.4 * normalizedValue;

  const numberTexture = React.useMemo(
    () => createNumberTexture(value, isSorted),
    [value, isSorted]
  );

  const checkmarkTexture = React.useMemo(() => createCheckmarkTexture(), []);

  const scarfColor =
    SCARF_COLORS[Math.abs(Math.floor(value * 3)) % SCARF_COLORS.length];

  const bodyBlack = "#181924";
  const beakOrange = "#f97316";

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[
        baseScale * scale[0],
        baseScale * scale[1],
        baseScale * scale[2],
      ]}
    >
      {/* 1. Main Egg Body */}
      <mesh position={[0, 0.62, 0]} scale={[1, 1.28, 0.95]} castShadow>
        <sphereGeometry args={[0.46, 32, 32]} />
        <meshStandardMaterial
          color={bodyBlack}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* 2. White Belly Breast */}
      <mesh position={[0, 0.58, 0.23]} scale={[0.88, 1.18, 0.62]}>
        <sphereGeometry args={[0.4, 28, 28]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Belly Number Badge */}
      <mesh position={[0, 0.56, 0.49]}>
        <planeGeometry args={[0.48, 0.48]} />
        <meshBasicMaterial map={numberTexture} transparent />
      </mesh>

      {/* 4. Head Group (with independent rotation) */}
      <group position={[0, 1.32, 0]} rotation={headRotation}>
        {/* Head Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.32, 28, 28]} />
          <meshStandardMaterial
            color={bodyBlack}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>

        {/* Eyes & Specular highlights */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.13, 0.07, 0.24]}>
            {/* White Sclera */}
            <mesh scale={[1, 1.15, 1]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>

            {/* Dark Pupil */}
            <mesh position={[0, 0, 0.05]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#090a0f" roughness={0.1} />
            </mesh>

            {/* Specular Catchlight Sparkle (Cute Eye Highlight) */}
            <mesh position={[0.02, 0.025, 0.085]}>
              <sphereGeometry args={[0.016, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.015, -0.018, 0.085]}>
              <sphereGeometry args={[0.009, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Rosy Pink Blush Cheeks */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.22, -0.05, 0.22]}
            rotation={[0, side * 0.3, 0]}
          >
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color="#f472b6" transparent opacity={0.45} />
          </mesh>
        ))}

        {/* Beak */}
        <mesh position={[0, -0.03, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.085, 0.22, 16]} />
          <meshStandardMaterial
            color={beakOrange}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>

        {/* Earmuffs */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.33, 0.04, 0]}
            rotation={[0, 0, side * 0.1]}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={scarfColor} roughness={0.7} />
          </mesh>
        ))}
        {/* Earmuff Headband */}
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.26, 0.025, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Cozy Knitted Scarf */}
      <group position={[0, 1.08, 0]}>
        {/* Collar ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.31, 0.08, 16, 32]} />
          <meshStandardMaterial color={scarfColor} roughness={0.75} />
        </mesh>
        {/* Scarf knot & draped tails */}
        <mesh position={[0.16, -0.06, 0.3]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={scarfColor} roughness={0.75} />
        </mesh>
        <mesh
          position={[0.18, -0.22, 0.32]}
          rotation={[0.1, -0.15, -0.2]}
          scale={[0.1, 0.24, 0.04]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={scarfColor} roughness={0.75} />
        </mesh>
      </group>

      {/* 6. Flappable Wings with Shoulder Pivots */}
      {/* Left Wing */}
      <group position={[-0.44, 0.82, 0]} rotation={wingLeftRotation}>
        <mesh
          position={[-0.05, -0.24, 0]}
          rotation={[0, 0, 0.22]}
          scale={[0.3, 1.25, 0.65]}
          castShadow
        >
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color={bodyBlack} roughness={0.65} />
        </mesh>
      </group>

      {/* Right Wing */}
      <group position={[0.44, 0.82, 0]} rotation={wingRightRotation}>
        <mesh
          position={[0.05, -0.24, 0]}
          rotation={[0, 0, -0.22]}
          scale={[0.3, 1.25, 0.65]}
          castShadow
        >
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshStandardMaterial color={bodyBlack} roughness={0.65} />
        </mesh>
      </group>

      {/* 7. Flippers / Feet */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.2, 0.04, 0.28]}
          rotation={[0, side * 0.1, 0]}
          scale={[1, 0.38, 1.45]}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color={beakOrange}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* 8. Floating Checkmark Badge (✓) When Sorted - Always Facing Forward with Gentle Bob */}
      {isSorted && (
        <group
          position={[0, 2.15 + Math.sin(time * 3 + value) * 0.06, 0.1]}
          rotation={[
            0,
            Math.sin(time * 2 + value) * 0.12,
            Math.sin(time * 3) * 0.05,
          ]}
        >
          {/* Gold Medallion Rim & Disc facing camera */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.04, 32]} />
            <meshStandardMaterial
              color="#eab308"
              emissive="#ca8a04"
              emissiveIntensity={0.6}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
          {/* Front Checkmark Texture */}
          <mesh position={[0, 0, 0.026]}>
            <planeGeometry args={[0.48, 0.48]} />
            <meshBasicMaterial map={checkmarkTexture} transparent />
          </mesh>
        </group>
      )}

      {/* 9. Comparison Glow Spotlight Aura Beneath Feet */}
      {isCompared && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.62, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.6 + 0.3 * Math.sin(time * 8)}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
