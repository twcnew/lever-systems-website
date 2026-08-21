import type { ReactNode } from "react";
import { withBasePath } from "@/lib/basePath";

type GalleryFrameTone = "sky" | "sand" | "mint" | "lilac" | "peach";

type GalleryFrameProps = {
  /** Stable slot id so painting assets can be wired in later. */
  slotId: string;
  /** Artwork title shown on the plaque, e.g. "CRM Enrichment". */
  title: string;
  /** Plaque medium line, e.g. "oil on data, 2026". */
  medium?: string;
  tone?: GalleryFrameTone;
  /** When provided, the painting is displayed inside the frame. */
  src?: string;
  alt?: string;
  ratio?: "landscape" | "portrait" | "wide" | "linkedin";
  /** How the painting fills the frame. */
  fit?: "cover" | "contain";
  /** Apply the halftone/dither treatment over the artwork. */
  dither?: boolean;
  /** Live HTML artwork (studio assets). Ignored when `src` is set. */
  children?: ReactNode;
};

export function GalleryFrame({
  slotId,
  title,
  medium = "oil on data, 2026",
  tone = "sand",
  src,
  alt,
  ratio = "landscape",
  fit = "cover",
  dither = false,
  children,
}: GalleryFrameProps) {
  const live = Boolean(children) && !src;

  return (
    <figure className={`gframe gframe--${tone} gframe--${ratio}`} data-slot={slotId}>
      <div className="gframe__frame">
        <div className="gframe__mat">
          <div
            className={`gframe__art${dither ? " gframe__art--dither" : ""}${live ? " gframe__art--live" : ""}`}
          >
            {src ? (
              <img
                className={`gframe__img gframe__img--${fit}`}
                src={withBasePath(src)}
                alt={alt ?? title}
              />
            ) : children ? (
              children
            ) : (
              <span className="gframe__pending" aria-hidden="true">
                ◫
              </span>
            )}
          </div>
        </div>
      </div>
      <figcaption className="gframe__plaque">
        <span className="gframe__title">{title}</span>
        <span className="gframe__medium">{medium}</span>
      </figcaption>
    </figure>
  );
}
