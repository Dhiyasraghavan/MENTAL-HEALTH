"use client";

import dynamic from "next/dynamic";
import React from "react";

const MagnetLinesComponent = dynamic(() => import("./MagnetLines"), {
  ssr: false,
  loading: () => null,
});

interface MagnetLinesLazyProps {
  className?: string;
  intensity?: number;
  speed?: number;
  colors?: string[];
}

export default React.memo(function MagnetLinesLazy(
  props: MagnetLinesLazyProps,
) {
  return <MagnetLinesComponent {...props} />;
});
