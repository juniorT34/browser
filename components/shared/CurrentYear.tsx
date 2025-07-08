"use client";
import { useMemo } from "react";
export function CurrentYear() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return <>{year}</>;
} 