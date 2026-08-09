"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { CLOSING_CONTENT, getCalUiConfig } from "@/lib/closingContent";
import { trackCal } from "@/lib/analytics";

type CalEventDetail = {
  type?: string;
  data?: unknown;
};

export function ClosingCalEmbed() {
  const { namespace, calLink, layout, theme } = CLOSING_CONTENT.cal;

  useEffect(() => {
    let cancelled = false;
    const firedReady = { link: false, booker: false };

    (async () => {
      const cal = await getCalApi({ namespace });
      if (cancelled) return;

      const applyUi = () => {
        cal("ui", getCalUiConfig());
      };

      applyUi();

      cal("on", {
        action: "linkReady",
        callback: () => {
          applyUi();
          if (!firedReady.link) {
            firedReady.link = true;
            trackCal("cal_embed_ready", { ready: "linkReady" });
          }
        },
      });

      cal("on", {
        action: "*",
        callback: (e: { detail?: CalEventDetail }) => {
          const type = e?.detail?.type;
          if (
            type === "datePicked" ||
            type === "slotSelected" ||
            type === "bookerReady"
          ) {
            applyUi();
          }
          if (type === "bookerReady" && !firedReady.booker) {
            firedReady.booker = true;
            trackCal("cal_embed_ready", { ready: "bookerReady" });
          }
          if (type === "datePicked") {
            trackCal("cal_date_picked");
          }
          if (type === "slotSelected") {
            trackCal("cal_slot_selected");
          }
          if (
            type === "bookingSuccessful" ||
            type === "bookingSuccessfulV2"
          ) {
            trackCal("cal_booking_successful", {
              cal_event: type,
            });
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
