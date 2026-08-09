type VisualSlotTone = "sky" | "sand" | "mint" | "lilac" | "peach";

type VisualSlotProps = {
  slotId: string;
  label?: string;
  tone?: VisualSlotTone;
};

export function VisualSlot({ slotId, label = "Visual asset", tone = "sand" }: VisualSlotProps) {
  return (
    <figure className={`visual-slot visual-slot--${tone}`} data-slot={slotId}>
      <div className="visual-slot__frame" aria-label={label}>
        <span className="visual-slot__tag">paint · ascii</span>
        <span className="visual-slot__id">{slotId}</span>
      </div>
    </figure>
  );
}
