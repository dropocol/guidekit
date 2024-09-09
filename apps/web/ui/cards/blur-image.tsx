"use client";

import cn from "clsx";
import Image from "next/image";
import { useState } from "react";
import { ImageProps } from "next/image";

export default function BlurImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={cn(
        props.className,
        "duration-700 ease-in-out",
        isLoading ? "scale-105 blur-lg" : "scale-100 blur-0",
      )}
      onLoad={() => setLoading(false)}
    />
  );
}
