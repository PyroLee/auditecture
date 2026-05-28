import { useEffect, useRef, useState } from 'react';

interface ConfirmableDeleteProps {
  onConfirm: () => void;
  /** Auto-cancel the pending confirmation after this many ms */
  timeoutMs?: number;
  /** Class applied to the resting × button */
  className?: string;
  /** Label for screen readers */
  ariaLabel?: string;
}

/**
 * Two-tap inline delete affordance — replaces native confirm() with
 * a hand-drawn-friendly UI. First tap arms; second tap (within timeout) deletes.
 */
export function ConfirmableDelete({
  onConfirm,
  timeoutMs = 2500,
  className,
  ariaLabel = 'Delete',
}: ConfirmableDeleteProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function disarm() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setArmed(false);
  }

  function arm() {
    setArmed(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setArmed(false), timeoutMs);
  }

  if (armed) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-sans"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Confirm delete"
          className="px-1.5 py-0.5 rounded bg-sectionWine text-paper hover:bg-sectionWineInk font-medium"
          onClick={(e) => {
            e.stopPropagation();
            disarm();
            onConfirm();
          }}
        >
          delete
        </button>
        <button
          aria-label="Cancel"
          className="text-inkMute hover:text-inkSoft"
          onClick={(e) => {
            e.stopPropagation();
            disarm();
          }}
        >
          cancel
        </button>
      </span>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        arm();
      }}
    >
      ×
    </button>
  );
}
