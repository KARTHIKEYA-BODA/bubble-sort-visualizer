import React from "react";
import { Composition } from "remotion";
import { Sort } from "./Sort";
import { TOTAL_FRAMES } from "./trace";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Sort"
    component={Sort}
    width={720}
    height={1280}
    fps={30}
    durationInFrames={TOTAL_FRAMES}
  />
);
