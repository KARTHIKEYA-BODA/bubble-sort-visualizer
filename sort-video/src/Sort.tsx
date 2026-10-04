import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { steps } from "./trace";
import { Scene } from "./Scene";
import { CodePanel } from "./CodePanel";
import { AudioTracks } from "./AudioTracks";

export const Sort: React.FC = () => {
  const frame = useCurrentFrame();

  // Find active step from timeline
  const stepIndex = steps.findIndex(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.duration
  );
  const activeIndex = stepIndex === -1 ? steps.length - 1 : stepIndex;
  const currentStep = steps[activeIndex];

  const stepFrame = Math.max(0, frame - currentStep.startFrame);
  const stepProgress = Math.min(1, Math.max(0, stepFrame / currentStep.duration));

  const isSortedAll = currentStep.action === "sorted";

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1e1b38 0%, #2f2b54 35%, #46406e 70%, #635b8f 100%)",
        color: "#ffffff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sound Effects & Audio Synchronization */}
      <AudioTracks steps={steps} />
      {/* 1. Header Section */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            color: "#fde047",
            textShadow: "0 4px 20px rgba(250, 204, 21, 0.4)",
            lineHeight: 1.1,
          }}
        >
          Bubble Sort
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#cbd5e1",
              letterSpacing: "0.5px",
            }}
          >
            Python 3D Character Visualization
          </span>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(255, 255, 255, 0.15)",
              padding: "2px 9px",
              borderRadius: 10,
              color: "#f8fafc",
            }}
          >
            {isSortedAll
              ? "DONE ✓"
              : currentStep.action === "intro"
                ? "START"
                : `Pass ${currentStep.i + 1} / 4`}
          </span>
        </div>
      </div>

      {/* 2. Outro Celebration Overlay Banner (Frames in sky, above penguins) */}
      {isSortedAll && (
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 25,
          }}
        >
          <div
            style={{
              padding: "10px 36px",
              borderRadius: 24,
              background: "rgba(15, 23, 42, 0.9)",
              border: "3px solid #facc15",
              boxShadow: "0 14px 45px rgba(250, 204, 21, 0.4)",
              textAlign: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#fde047",
                letterSpacing: "1px",
                textShadow: "0 2px 10px rgba(234, 179, 8, 0.6)",
              }}
            >
              ✓ SORTED ✓
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              All elements in ascending order
            </div>
          </div>
        </div>
      )}

      {/* 3. 3D ThreeCanvas Scene */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          width: 720,
          height: 650,
        }}
      >
        <ThreeCanvas
          width={720}
          height={650}
          shadows
          camera={{
            position: [0, 3.15, 11.8],
            fov: 35,
          }}
        >
          <Scene
            step={currentStep}
            stepProgress={stepProgress}
            frame={frame}
          />
        </ThreeCanvas>

        {/* Soft bottom vignette gradient fade for seamless UI transition */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(30, 27, 56, 0.95) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 4. Action Status Pill */}
      <div
        style={{
          position: "absolute",
          top: 752,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "8px 20px",
            borderRadius: 30,
            background:
              currentStep.action === "swap"
                ? "linear-gradient(90deg, #ea580c, #f59e0b)"
                : currentStep.action === "compare"
                  ? "linear-gradient(90deg, #0284c7, #38bdf8)"
                  : currentStep.action === "element_sorted" || isSortedAll
                    ? "linear-gradient(90deg, #16a34a, #22c55e)"
                    : "rgba(30, 41, 59, 0.85)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.4px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>
            {currentStep.action === "swap"
              ? "⚡ SWAP IN ACTION"
              : currentStep.action === "compare"
                ? "👀 COMPARING VALUES"
                : currentStep.action === "element_sorted"
                  ? "⭐ ELEMENT LOCKED"
                  : isSortedAll
                    ? "🎉 SORT COMPLETED"
                    : "🐧 BUBBLE SORT READY"}
          </span>
          <span style={{ opacity: 0.85, fontWeight: 400 }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {currentStep.description}
          </span>
        </div>
      </div>

      {/* 5. Python Code Panel */}
      <CodePanel step={currentStep} />

      {/* 6. Bottom Array State Cards & Sorted Badges */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "#94a3b8",
          }}
        >
          Array State
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {currentStep.arr.map((val, idx) => {
            const isSorted = currentStep.sortedIndices.includes(idx);
            const isComparing = currentStep.compare?.includes(idx);
            const isSwapping = currentStep.swap?.includes(idx);

            let borderColor = "rgba(255, 255, 255, 0.15)";
            let bgColor = "rgba(15, 23, 42, 0.65)";
            let textColor = "#f8fafc";

            if (isSwapping) {
              borderColor = "#f97316";
              bgColor = "rgba(234, 88, 12, 0.35)";
              textColor = "#ffedd5";
            } else if (isComparing) {
              borderColor = "#38bdf8";
              bgColor = "rgba(14, 165, 233, 0.3)";
              textColor = "#e0f2fe";
            } else if (isSorted) {
              borderColor = "#eab308";
              bgColor = "rgba(234, 179, 8, 0.25)";
              textColor = "#fef08a";
            }

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 48,
                    borderRadius: 12,
                    border: `2px solid ${borderColor}`,
                    background: bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: textColor,
                    boxShadow:
                      isComparing || isSwapping
                        ? "0 0 16px rgba(56, 189, 248, 0.4)"
                        : "none",
                    transform:
                      isComparing || isSwapping
                        ? "translateY(-3px)"
                        : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {val}
                </div>

                {/* Sorted Checkmark indicator */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isSorted ? "#22c55e" : "transparent",
                    textShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
                  }}
                >
                  {isSorted ? "✓" : "·"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
