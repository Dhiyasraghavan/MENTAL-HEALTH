"use client";

import dynamic from "next/dynamic";
import React from "react";

const LightPillarComponent = dynamic(() => import("./LightPillar"), {
  ssr: false,
  loading: () => null,
});

interface LightPillarLazyProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  pillarRotation?: number;
  quality?: "low" | "medium" | "high";
}

export default React.memo(function LightPillarLazy(
  props: LightPillarLazyProps,
) {
  return <LightPillarComponent {...props} />;
});
