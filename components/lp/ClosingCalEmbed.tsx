"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { CLOSING_CONTENT, getCalUiConfig } from "@/lib/closingContent";

export function ClosingCalEmbed() {
  const { namespace, calLink, layout, theme } = CLOSING_CONTENT.cal;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cal = await getCalApi({ namespace });
      if (cancelled) return;

      const applyUi = () => {
        cal("ui", getCalUiConfig());
      };

      applyUi();

      cal("on", {
        action: "linkReady",
        callback: applyUi,
      });

      // Re-assert theme after date picks so selected-day brand color sticks.
      cal("on", {
        action: "*",
        callback: (e: { detail?: { type?: string } }) => {
          const type = e?.detail?.type;
          if (
            type === "datePicked" ||
            type === "slotSelected" ||
            type === "bookerReady"
          ) {
            applyUi();
          }
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [namespace]);

  return (
    <div className="lp-closing-cal" aria-label="Book a strategy call">
      <Cal
        namespace={namespace}
        calLink={calLink}
        style={{ width: "100%" }}
        config={{
          layout,
          useSlotsViewOnSmallScreen: "true",
          theme,
        }}
      />
    </div>
  );
}
