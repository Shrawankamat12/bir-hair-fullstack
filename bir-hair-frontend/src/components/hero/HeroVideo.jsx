import { useEffect, useMemo, useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { getVideoEmbed } from '../../lib/video';
import { resolveImageUrl } from '../../lib/api';
import { SafeImg } from './HeroShared';


export default function HeroVideo({ media, poster, fallbackPoster, active, onMediaActive, className = '' }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const embed = useMemo(() => getVideoEmbed(media?.url), [media?.url]);
  const label = media?.title || media?.alt || 'Brand video';

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  useEffect(() => {
    if (!playing) return undefined;
    onMediaActive?.(true);
    return () => onMediaActive?.(false);
  }, [playing, onMediaActive]);

  const playable = embed && !failed;
  let player = null;
  if (playing && playable) {
    if (embed.type === 'file') {
      player = (
        <video
          className="h-full w-full bg-black object-cover"
          src={resolveImageUrl(embed.embedUrl)}
          poster={poster || undefined}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label={label}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
      );
    } else {
      const sep = embed.embedUrl.includes('?') ? '&' : '?';
      const params = embed.type === 'youtube' ? 'autoplay=1&rel=0&playsinline=1' : 'autoplay=1';
      player = (
        <iframe
          className="h-full w-full border-0 bg-black"
          src={`${embed.embedUrl}${sep}${params}`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }
  }

  return (
    <div
      data-hero-noswipe
      className={`relative overflow-hidden rounded-[22px] bg-[#2b0f1f] shadow-[0_30px_60px_-24px_rgba(226,36,103,0.45)] ring-1 ring-white/60 ${className}`}
    >
      {player || (
        <>
          <SafeImg
            src={poster}
            fallback={fallbackPoster}
            alt={media?.alt || 'Video preview'}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
          {playable ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${label}`}
              className="hs-play"
            >
              <FiPlay aria-hidden="true" />
            </button>
          ) : (
            failed && (
              <p role="status" className="absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-xs font-medium text-white">
                This video is currently unavailable.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}