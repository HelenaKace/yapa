import Image from "next/image";

export function Logo({ className = "h-16 md:h-20" }) {
  return (
    <Image
      src="/logos/logo.png"
      alt="YAPA"
      width={220}
      height={64}
      className={`w-auto object-contain ${className}`}
      priority
    />
  );
}
