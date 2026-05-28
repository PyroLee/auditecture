interface AddSectionButtonProps {
  onClick: () => void;
}

export function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <button
      aria-label="Add section"
      onClick={onClick}
      className="self-center w-[50px] h-[70px] flex items-center justify-center text-inkMute hover:text-inkSoft -mt-1"
    >
      <svg viewBox="0 0 30 30" fill="none" width={30} height={30} aria-hidden="true">
        <path
          d="M15 5 Q15.4 14.5 15 25"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          filter="url(#ink-bleed-soft)"
        />
        <path
          d="M5 15 Q14.6 15.4 25 15"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          filter="url(#ink-bleed-soft)"
        />
      </svg>
    </button>
  );
}
