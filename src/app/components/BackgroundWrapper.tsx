"use client";

import { ReactNode } from "react";
import FloatingLines from "./FloatingLines";

interface BackgroundWrapperProps {
  children: ReactNode;
}

export default function BackgroundWrapper({
  children,
}: BackgroundWrapperProps) {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* FloatingLines Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        className="gradient-aurora"
      >
        <FloatingLines />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
