import type { CaseStudyVisual } from "@/lib/caseStudies/types";
import { withBasePath } from "@/lib/basePath";

type CaseStudyVisualSlotProps = {
  visual: CaseStudyVisual;
};

export function CaseStudyVisualSlot({ visual }: CaseStudyVisualSlotProps) {
  if (visual.src) {
    return (
      <figure className="cs-visual">
        <img
          className="cs-visual__img"
          src={withBasePath(visual.src)}
          alt={visual.alt}
          loading="lazy"
          decoding="async"
        />
        {visual.caption && (
          <figcaption className="cs-visual__caption">{visual.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="cs-visual">
      <div className="cs-visual__placeholder" aria-label={visual.alt}>
        <span className="cs-visual__placeholder-label">Visual asset</span>
        <span className="cs-visual__placeholder-alt">{visual.alt}</span>
      </div>
    </figure>
  );
}
