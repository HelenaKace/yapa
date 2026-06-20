import Image from "next/image";

export function Logo({ className = "" }) {
  return (
    <Image
      src="/logos/logo.png"
      alt="YAPA"
      width={220}
      height={64}
      className={`h-16 w-auto object-contain md:h-20 ${className}`}
      priority
    />
  );
}