interface AddTrackButtonProps {
  onClick: () => void;
}

export function AddTrackButton({ onClick }: AddTrackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-1 pt-2 cursor-pointer font-hand text-inkMute hover:text-inkSoft text-left bg-transparent border-none"
      style={{ fontSize: 24, letterSpacing: '-0.3px', transform: 'rotate(-0.4deg)', marginTop: 10 }}
    >
      <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M11 3 Q11.3 10.5 11 19"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          filter="url(#ink-bleed-soft)"
        />
        <path
          d="M3 11 Q10.6 11.3 19 11"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          filter="url(#ink-bleed-soft)"
        />
      </svg>
      Add track
    </button>
  );
}
