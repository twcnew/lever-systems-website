"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { track, type AnalyticsProps } from "@/lib/analytics";

type TrackedAnchorProps = {
  href: string;
  children: ReactNode;
  className?: string;
  event: string;
  eventProps?: AnalyticsProps;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<ComponentProps<"a">, "href" | "onClick" | "children" | "className">;

function fire(event: string, eventProps: AnalyticsProps | undefined, href: string) {
  track(event, { href, ...eventProps });
}

/** Internal Next Link or external/hash anchor with analytics on click. */
export function TrackedAnchor({
  href,
  children,
  className,
  event,
  eventProps,
  onClick,
  ...rest
}: TrackedAnchorProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    fire(event, eventProps, href);
    onClick?.(e);
  };

  const isAppRoute = href.startsWith("/") && !href.startsWith("/#") && !href.startsWith("//");

  if (isAppRoute) {
    return (
      <Link href={href} className={className} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
