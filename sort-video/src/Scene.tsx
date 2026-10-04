/// <reference types="@react-three/fiber" />

import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Easing } from "remotion";
import { Step } from "./trace";
import { Penguin } from "./Penguin";
import { WinterEnvironment } from "./Environment";

export const slotX = (i: number, total = 5) => {
  const center = (total - 1) / 2;
  const spacing = 1.38;
  return (i - center) * spacing;
};

// Canvas texture for floating 3D Comparison Badge
const createComparisonTexture = (
  leftVal: number,
  rightVal: number,
  result?: boolean,
  action?: string
): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 512, 160);

  // Rounded pill background
  const r = 40;
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 140, r);

  const isSwap = action === "swap" || result === true;
  const isNoSwap = action === "no_swap" || result === false;

  let bgGrad;
  if (isSwap) {
    bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0, "rgba(234, 88, 12, 0.95)");
    bgGrad.addColorStop(1, "rgba(245, 158, 11, 0.95)");
  } else if (isNoSwap) {
    bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0, "rgba(14, 165, 233, 0.95)");
    bgGrad.addColorStop(1, "rgba(59, 130, 246, 0.95)");
  } else {
    bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0, "rgba(30, 41, 59, 0.92)");
    bgGrad.addColorStop(1, "rgba(51, 65, 85, 0.92)");
  }

  ctx.fillStyle = bgGrad;
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = isSwap ? "#fef08a" : isNoSwap ? "#bae6fd" : "#cbd5e1";
  ctx.stroke();

  // Text: e.g. "90 > 50 SWAP!" or "35 ≤ 90 KEEP"
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const operator = result === false ? "≤" : ">";
  const statusSuffix = isSwap ? "  SWAP!" : isNoSwap ? "  KEEP" : " ?";
  const text = `${leftVal} ${operator} ${rightVal}${statusSuffix}`;

  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillText(text, 256, 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Camera Controller Component inside ThreeCanvas
const CameraRig: React.FC<{
  frame: number;
  step: Step;
  stepProgress: number;
}> = ({ frame, step, stepProgress }) => {
  const { camera } = useThree();

  React.useEffect(() => {
    // 1. Intro sequence camera glide
    if (step.action === "intro") {
      const introProgress = Math.min(frame / step.duration, 1);
      const easeIntro = Easing.out(Easing.cubic)(introProgress);

      const startY = 4.2;
      const endY = 3.15;
      const startZ = 14.2;
      const endZ = 11.8;

      camera.position.set(
        0,
        startY + (endY - startY) * easeIntro,
        startZ + (endZ - startZ) * easeIntro
      );
      camera.rotation.set(-0.14 + 0.04 * easeIntro, 0, 0);
      return;
    }

    // 2. Outro Celebration camera framing
    if (step.action === "sorted") {
      const outroProgress = Math.min(stepProgress * 2, 1);
      const easeOutro = Easing.out(Easing.cubic)(outroProgress);

      const targetY = 3.15 + 0.3 * easeOutro;
      const targetZ = 11.8 + 0.8 * easeOutro;

      camera.position.set(0, targetY, targetZ);
      camera.rotation.set(-0.1 - 0.02 * easeOutro, 0, 0);
      return;
    }

    // 3. During Swaps: dynamically nudge camera slightly to center the swap action
    if (step.action === "swap" && step.swap) {
      const midX = (slotX(step.swap[0]) + slotX(step.swap[1])) / 2;
      const arc = Math.sin(Math.PI * stepProgress);

      const targetX = midX * 0.14 * arc;
      const targetY = 3.15 - 0.06 * arc;
      const targetZ = 11.8 - 0.4 * arc;

      camera.position.set(targetX, targetY, targetZ);
      camera.rotation.set(-0.1, targetX * 0.02, 0);
      return;
    }

    // 4. Default focused view
    camera.position.set(0, 3.15, 11.8);
    camera.rotation.set(-0.1, 0, 0);
  }, [frame, step, stepProgress, camera]);

  return null;
};

export const Scene: React.FC<{
  step: Step;
  stepProgress: number;
  frame: number;
}> = ({ step, stepProgress, frame }) => {
  const time = frame / 30;
  const values = step.arr;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // Smooth easing for transitions
  const smoothT = Easing.inOut(Easing.cubic)(stepProgress);

  const isSwap = step.action === "swap" && step.swap !== undefined;
  const isCompare = step.action === "compare" && step.compare !== undefined;
  const isNoSwap = step.action === "no_swap" && step.compare !== undefined;
  const isSortedAll = step.action === "sorted";

  // Comparison Badge Texture
  const comparisonTexture = React.useMemo(() => {
    if (
      (isCompare || isNoSwap) &&
      step.leftVal !== undefined &&
      step.rightVal !== undefined
    ) {
      return createComparisonTexture(
        step.leftVal,
        step.rightVal,
        step.comparisonResult,
        step.action
      );
    }
    return null;
  }, [isCompare, isNoSwap, step.leftVal, step.rightVal, step.comparisonResult, step.action]);

  // Comparison Badge position
  const comparisonBadgePos = React.useMemo(() => {
    if (step.compare) {
      const midX = (slotX(step.compare[0]) + slotX(step.compare[1])) / 2;
      return [midX, 2.7, 0.35] as [number, number, number];
    }
    return [0, 2.7, 0.35] as [number, number, number];
  }, [step.compare]);

  return (
    <>
      {/* Dynamic Camera Controller */}
      <CameraRig frame={frame} step={step} stepProgress={stepProgress} />

      {/* Atmospheric Winter Environment */}
      <WinterEnvironment
        frame={frame}
        slotCount={5}
        slotX={slotX}
        comparedSlots={step.compare}
        sortedIndices={step.sortedIndices}
      />

      {/* 3D Floating Comparison Banner above comparing penguins (during compare/no_swap) */}
      {(isCompare || isNoSwap) && comparisonTexture && (
        <group
          position={comparisonBadgePos}
          scale={Math.min(stepProgress * 4, 1)}
        >
          <mesh>
            <planeGeometry args={[1.5, 0.48]} />
            <meshBasicMaterial map={comparisonTexture} transparent />
          </mesh>
        </group>
      )}

      {/* Penguins */}
      {values.map((val) => {
        const to = step.arr.indexOf(val);
        const from = step.prevArr.indexOf(val);
        const normalizedVal =
          maxVal === minVal ? 1 : (val - minVal) / (maxVal - minVal);

        const isCurrentlyComparing =
          (isCompare || isNoSwap) && step.compare?.includes(to);
        const isCurrentlySwapping = isSwap && from !== to;
        const isElementSorted = step.sortedIndices.includes(to);

        // Position coordinates
        let x = slotX(to);
        let y = 0;
        let z = 0;

        // Rotation & Poses
        let bodyRotationY = 0;
        let bodyRotationZ = 0;
        let headRotationY = 0;
        let headPitch = 0;
        let scaleX = 1;
        let scaleY = 1;
        let scaleZ = 1;

        let wingLeftZ = -0.28;
        let wingRightZ = 0.28;

        // 1. SWAP ANIMATION (Parabolic Leap & Cross)
        if (isCurrentlySwapping) {
          const movingRight = to > from;
          const arc = Math.sin(Math.PI * smoothT);

          if (movingRight) {
            // Larger Penguin: High dramatic arc forward towards camera
            x = slotX(from) + (slotX(to) - slotX(from)) * smoothT;
            y = arc * 1.55;
            z = arc * 0.9;
            bodyRotationZ = -arc * 0.28; // bank into the leap
          } else {
            // Smaller Penguin: Lower nimble under-hop dipping backward with slight speed offset
            const smoothB = Easing.inOut(Easing.quad)(stepProgress);
            x = slotX(from) + (slotX(to) - slotX(from)) * smoothB;
            y = arc * 0.65;
            z = -arc * 0.65;
            bodyRotationZ = arc * 0.18;
          }

          // Squash & Stretch dynamics:
          if (stepProgress < 0.16) {
            // Crouch before jump
            const crouch = Math.sin((stepProgress / 0.16) * Math.PI);
            scaleY = 1 - crouch * 0.18;
            scaleX = 1 + crouch * 0.14;
          } else if (stepProgress < 0.82) {
            // Stretch in mid-air
            scaleY = 1 + arc * 0.15;
            scaleX = 1 - arc * 0.08;
            // Wing flapping in flight
            const flap = Math.sin(stepProgress * 28) * 0.6;
            wingLeftZ = -0.6 + flap;
            wingRightZ = 0.6 - flap;
          } else {
            // Impact squash upon landing
            const settle = (stepProgress - 0.82) / 0.18;
            const squash = Math.sin(settle * Math.PI) * 0.22;
            scaleY = 1 - squash;
            scaleX = 1 + squash * 0.16;
            y += Math.sin(settle * Math.PI) * 0.08;
          }
        }

        // 2. COMPARISON REACTION
        else if (isCurrentlyComparing && step.compare) {
          const isLeft = to === step.compare[0];
          const turnProgress = Math.min(stepProgress * 3.5, 1);
          const turnEase = Easing.out(Easing.cubic)(turnProgress);

          // Turn toward each other
          bodyRotationY = (isLeft ? 0.38 : -0.38) * turnEase;
          headRotationY = (isLeft ? 0.78 : -0.78) * turnEase;

          // Lean inward
          bodyRotationZ = (isLeft ? -0.1 : 0.1) * turnEase;

          // Curious bounce & enlargement
          const bounce = Math.abs(Math.sin(stepProgress * Math.PI * 2)) * 0.14;
          y = bounce;
          scaleY = 1 + bounce * 0.35;
          scaleX = 1 + bounce * 0.18;

          // Wings lifted curiously
          wingLeftZ = -0.55;
          wingRightZ = 0.55;
        }

        // 3. ELEMENT SORTED HAPPY HOP
        else if (step.action === "element_sorted" && to === step.j) {
          const hop = Math.abs(Math.sin(stepProgress * Math.PI * 3)) * 0.32;
          y = hop;
          scaleY = 1 + hop * 0.4;
          wingLeftZ = -0.3 + Math.sin(stepProgress * 24) * 0.65;
          wingRightZ = 0.3 - Math.sin(stepProgress * 24) * 0.65;
          headPitch = -0.15;
        }

        // 4. FINAL CELEBRATION WAVE (All penguins rejoice!)
        else if (isSortedAll) {
          const wave = Math.sin(time * 7 + to * 1.25);
          const hop = Math.max(0, wave) * 0.36;
          y = hop;
          bodyRotationZ = Math.sin(time * 5 + to) * 0.12;
          headRotationY = Math.sin(time * 4 + to) * 0.28;
          headPitch = -0.16 + Math.sin(time * 6) * 0.1;

          wingLeftZ = -0.35 + Math.sin(time * 16 + to) * 0.7;
          wingRightZ = 0.35 - Math.sin(time * 16 + to) * 0.7;
        }

        // 5. INTRO GROUP GREETING JUMP (frames 8 to 28)
        else if (step.action === "intro" && frame >= 8 && frame <= 28) {
          const jumpP = (frame - 8) / 20;
          const arc = Math.sin(jumpP * Math.PI);
          y = arc * 0.75;
          headPitch = -0.15 * arc;
          wingLeftZ = -0.28 - arc * 0.55;
          wingRightZ = 0.28 + arc * 0.55;

          if (jumpP < 0.18) {
            const crouch = Math.sin((jumpP / 0.18) * Math.PI);
            scaleY = 1 - crouch * 0.16;
            scaleX = 1 + crouch * 0.12;
          } else if (jumpP > 0.82) {
            const squash = Math.sin(((jumpP - 0.82) / 0.18) * Math.PI) * 0.2;
            scaleY = 1 - squash;
            scaleX = 1 + squash * 0.15;
          } else {
            scaleY = 1 + arc * 0.12;
            scaleX = 1 - arc * 0.06;
          }
        }

        // 6. NORMAL IDLE POSE (Gentle breathing)
        else {
          const breath = Math.sin(time * 2.8 + to * 0.8) * 0.02;
          scaleY = 1 + breath;
          scaleX = 1 - breath * 0.5;
        }

        return (
          <Penguin
            key={val}
            value={val}
            normalizedValue={normalizedVal}
            position={[x, y, z]}
            rotation={[0, bodyRotationY, bodyRotationZ]}
            headRotation={[headPitch, headRotationY, 0]}
            scale={[scaleX, scaleY, scaleZ]}
            wingLeftRotation={[0, 0, wingLeftZ]}
            wingRightRotation={[0, 0, wingRightZ]}
            isSorted={isElementSorted}
            isCompared={Boolean(isCurrentlyComparing)}
            isSwapping={Boolean(isCurrentlySwapping)}
            time={time}
          />
        );
      })}
    </>
  );
};
