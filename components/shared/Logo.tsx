import Image from "next/image";

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <Image src="/ousec-logo.svg" alt="OUSEC Logo" width={size} height={size} priority />
  );
} 