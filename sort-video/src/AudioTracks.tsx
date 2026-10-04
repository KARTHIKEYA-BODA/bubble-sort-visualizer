import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { Step } from "./trace";

export const AudioTracks: React.FC<{ steps: Step[] }> = ({ steps }) => {
  return (
    <>
      {/* 1. Intro Group Jump Sound at frame 8 */}
      <Sequence from={8} durationInFrames={28}>
        <Audio src={staticFile("jump_intro.wav")} volume={0.9} />
      </Sequence>

      {/* 2. Step Synchronized Sounds */}
      {steps.map((step, idx) => {
        return (
          <React.Fragment key={idx}>
            {/* Coding Line Mechanical Click whenever a code step executes */}
            {step.action !== "intro" && (
              <Sequence from={step.startFrame} durationInFrames={8}>
                <Audio src={staticFile("code_click.wav")} volume={0.75} />
              </Sequence>
            )}

            {/* Comparison Tick Sound */}
            {step.action === "compare" && (
              <Sequence from={step.startFrame + 2} durationInFrames={12}>
                <Audio src={staticFile("compare_tick.wav")} volume={0.6} />
              </Sequence>
            )}

            {/* Parabolic Swap Leap & Whoosh Sound */}
            {step.action === "swap" && (
              <Sequence from={step.startFrame} durationInFrames={step.duration}>
                <Audio src={staticFile("swap_whoosh.wav")} volume={0.95} />
              </Sequence>
            )}

            {/* Element Locked in Sorted Position Golden Chime */}
            {step.action === "element_sorted" && (
              <Sequence from={step.startFrame} durationInFrames={step.duration}>
                <Audio src={staticFile("sorted_ding.wav")} volume={0.88} />
              </Sequence>
            )}

            {/* Final Celebration Outro Fanfare */}
            {step.action === "sorted" && (
              <Sequence from={step.startFrame} durationInFrames={step.duration}>
                <Audio src={staticFile("celebration.wav")} volume={1.0} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
