"use client";

import * as React from "react";

interface AiAudioPlayerProps {
  url: string | null;
  onEnded?: () => void;
  onPlayStart?: () => void;
}

export function AiAudioPlayer({ url, onEnded, onPlayStart }: AiAudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(console.error);
    }
  }, [url]);

  return (
    <audio
      ref={audioRef}
      onEnded={onEnded}
      onPlay={onPlayStart}
      className="hidden"
      aria-hidden="true"
    />
  );
}
