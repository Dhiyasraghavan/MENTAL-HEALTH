import { useEffect, useState } from "react";

export interface DevicePerformance {
  isLowEnd: boolean;
  isMobile: boolean;
  cores: number;
  memory: number;
  connection: string;
}

export function useDevicePerformance(): DevicePerformance {
  const [perf, setPerf] = useState<DevicePerformance>({
    isLowEnd: false,
    isMobile: false,
    cores: 4,
    memory: 8,
    connection: "4g",
  });

  useEffect(() => {
    // Detect mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Get CPU cores
    const cores = navigator.hardwareConcurrency || 4;

    // Get memory if available
    const memory = (navigator.deviceMemory as number) || 8;

    // Get connection type
    let connection = "4g";
    const nav = navigator as any;
    if (nav.connection?.effectiveType) {
      connection = nav.connection.effectiveType;
    }

    // Determine if low-end
    const isLowEnd =
      isMobile ||
      cores <= 2 ||
      memory <= 4 ||
      connection === "slow-2g" ||
      connection === "2g" ||
      connection === "3g";

    setPerf({
      isLowEnd,
      isMobile,
      cores,
      memory,
      connection,
    });
  }, []);

  return perf;
}
