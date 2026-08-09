/** Static Claude mascot — sits perched on a card edge, legs dangling, idle-animated in CSS. */
export function ClaudePeekMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 107 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g className="wb-mascot__legs">
        <g className="wb-mascot__legs-a">
          <rect x="11" y="60" width="11" height="24" fill="#DD775B" />
          <rect x="64" y="60" width="11" height="24" fill="#DD775B" />
        </g>
        <g className="wb-mascot__legs-b">
          <rect x="32" y="60" width="11" height="24" fill="#DD775B" />
          <rect x="85" y="60" width="11" height="24" fill="#DD775B" />
        </g>
      </g>
      <g className="wb-mascot__body">
        <rect x="11" width="85" height="65" fill="#DD775B" />
        <rect x="85" y="21" width="22" height="23" fill="#DD775B" />
        <rect y="21" width="22" height="23" fill="#DD775B" />
        <g className="wb-mascot__eyes">
          <rect x="75" y="26" width="11" height="11" fill="black" />
          <rect x="21" y="26" width="11" height="11" fill="black" />
        </g>
      </g>
    </svg>
  );
}
