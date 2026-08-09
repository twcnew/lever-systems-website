import type { ProblemSceneId } from "@/lib/whatBreaksContent";
import { withBasePath } from "@/lib/basePath";

type WhatBreaksSceneProps = {
  sceneId: ProblemSceneId;
};

export function WhatBreaksScene({ sceneId }: WhatBreaksSceneProps) {
  return (
    <div className={`wb-scene wb-scene--${sceneId}`} aria-hidden="true">
      {sceneId === "manual-lists" && (
        <img
          className="wb-scene__scene-ink"
          src={withBasePath("/what-breaks/manual-ink.png")}
          alt=""
        />
      )}

      {sceneId === "signals-unused" && (
        <img
          className="wb-scene__scene-ink"
          src={withBasePath("/what-breaks/signals-ink.png")}
          alt=""
        />
      )}

      {sceneId === "pipeline-chaos" && (
        <img
          className="wb-scene__scene-ink"
          src={withBasePath("/what-breaks/pipeline-ink.png")}
          alt=""
        />
      )}
    </div>
  );
}
