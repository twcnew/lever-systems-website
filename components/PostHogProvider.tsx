"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { enrichPageviewProps } from "@/lib/analytics";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const INTERNAL_FLAG = "lever_ph_internal";

let didInit = false;

function isInternalVisitor() {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(INTERNAL_FLAG) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("ph_internal") === "1") {
      localStorage.setItem(INTERNAL_FLAG, "1");
      return true;
    }
    if (params.get("ph_internal") === "0") {
      localStorage.removeItem(INTERNAL_FLAG);
      return false;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!key || !pathname) return;
    if (posthog.has_opted_out_capturing() || isInternalVisitor()) return;
    const qs = searchParams?.toString() ?? "";
    const props = enrichPageviewProps(pathname, qs);
    posthog.capture("$pageview", props);
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!key || didInit) return;
    posthog.init(key, {
      api_host: host,
      ui_host: "https://eu.posthog.com",
      person_profiles: "always",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: true,
      capture_heatmaps: true,
      capture_dead_clicks: true,
      rageclick: true,
      capture_exceptions: true,
      capture_performance: true,
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
        recordCrossOriginIframes: false,
        sampleRate: 1,
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
          ph.opt_out_capturing();
          return;
        }
        if (isInternalVisitor()) {
          ph.register({ $internal_or_test_user: true });
          ph.opt_out_capturing();
        }
      },
    });
    didInit = true;
  }, []);

  if (!key) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      <SiteAnalytics />
      {children}
    </PHProvider>
  );
}
