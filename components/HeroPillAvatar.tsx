"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export const FOUNDER_PHOTO_SRC = withBasePath("/founder/alexis.webp");
export const FOUNDER_NAME_INK_SRC = withBasePath("/founder/alexis-name-ink.png");

export function HeroPillAvatar() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setShowPlaceholder(false);
      setFailed(false);
    }
  }, []);

  return (
    <span className="hero__pill-avatar">
      {showPlaceholder && (
        <span className="hero__pill-avatar__placeholder" aria-hidden="true" />
      )}
      {!failed && (
        <img
          ref={imgRef}
          className="hero__pill-avatar__photo"
          src={FOUNDER_PHOTO_SRC}
          alt=""
          width={64}
          height={64}
          decoding="async"
          fetchPriority="high"
          onLoad={() => {
            setShowPlaceholder(false);
            setFailed(false);
          }}
          onError={() => {
            setFailed(true);
            setShowPlaceholder(false);
          }}
        />
      )}
    </span>
  );
}
