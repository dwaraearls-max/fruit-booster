import Image from "next/image";
import { cn } from "@/lib/utils";

type SmoothieCupImageProps = {
  src: string;
  alt: string;
  variant?: "grid" | "detail" | "thumb";
  priority?: boolean;
  className?: string;
};

export function SmoothieCupImage({
  src,
  alt,
  variant = "grid",
  priority = false,
  className,
}: SmoothieCupImageProps) {
  const isDetail = variant === "detail";
  const isThumb = variant === "thumb";

  return (
    <div className={cn("absolute inset-0 bg-transparent", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn(
          "object-contain object-bottom transition duration-300",
          isDetail ? "group-hover:scale-[1.02]" : isThumb ? "" : "p-1 group-hover:scale-[1.03]",
        )}
        sizes={
          isDetail
            ? "(max-width:768px) 100vw, 50vw"
            : isThumb
              ? "64px"
              : "(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        }
      />
    </div>
  );
}
