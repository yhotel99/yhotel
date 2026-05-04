"use client";

import { useEffect, useMemo, useState } from "react";
import NextImage, { type ImageProps } from "next/image";

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f1f5f9'/%3E%3Cpath d='M400 520l120-140 100 120 140-170 160 190H280z' fill='%23cbd5e1'/%3E%3Ccircle cx='460' cy='280' r='52' fill='%23cbd5e1'/%3E%3C/svg%3E";

const isRemoteImageUrl = (src: string): boolean => /^https?:\/\//i.test(src);

const toWebpUrl = (url: string): string => url.replace(/\.(png|jpe?g)$/i, ".webp");

export default function SafeImage(props: ImageProps) {
  const { src, onError, unoptimized, ...rest } = props;

  const initialSources = useMemo(() => {
    if (typeof src !== "string") return [src];

    if (!isRemoteImageUrl(src)) {
      return [src];
    }

    const webpSrc = toWebpUrl(src);
    if (webpSrc !== src) {
      return [webpSrc, src];
    }

    return [src];
  }, [src]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState<ImageProps["src"]>(initialSources[0]);

  useEffect(() => {
    setSourceIndex(0);
    setResolvedSrc(initialSources[0]);
  }, [initialSources]);

  const handleError: ImageProps["onError"] = (event) => {
    const nextIndex = sourceIndex + 1;
    if (nextIndex < initialSources.length) {
      setSourceIndex(nextIndex);
      setResolvedSrc(initialSources[nextIndex]);
    } else if (resolvedSrc !== FALLBACK_SRC) {
      setResolvedSrc(FALLBACK_SRC);
    }

    onError?.(event);
  };

  return (
    <NextImage
      {...rest}
      src={resolvedSrc}
      onError={handleError}
      unoptimized={unoptimized ?? true}
    />
  );
}
