"use client";

import { useEffect, useState } from "react";

export function useSimulatedLoading(ms = 2000): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);

  return loading;
}
