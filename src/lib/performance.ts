// Performance monitoring utility
export function reportWebVitals(metric: any) {
  if (typeof window !== "undefined") {
    // Send to analytics if needed
    console.debug("[Performance]", metric.name, metric.value);
  }
}

// Debounce utility for event handlers
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle utility for expensive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastRun = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      func(...args);
      lastRun = now;
    }
  };
}

// Request idle callback polyfill
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout
  return window.setTimeout(
    () =>
      callback({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline),
    1,
  ) as unknown as number;
}

export function cancelIdleCallback(id: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
