"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function BlogViewTracker({
  event,
  slug,
}: {
  event: string;
  slug?: string;
}) {
  useEffect(() => {
    track(event, slug ? { slug } : undefined);
  }, [event, slug]);

  return null;
}
