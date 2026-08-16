import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { GlowEffect } from './GlowEffect';

export function SportsMosaic({ sports, openLightbox }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const photos = sports?.photos || [];

  if (!photos.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Intro text */}
      {sports.intro && (
        <p className="max-w-3xl text-sm leading-relaxed text-body/80 sm:text-base">
          {sports.intro}
        </p>
      )}

      {/* Interactive Bento Mosaic Reel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        {photos.map((p, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={p.src}
              data-reveal
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => openLightbox({ src: p.src, title: p.title, caption: p.caption })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox({ src: p.src, title: p.title, caption: p.caption });
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Xem to ${p.title}`}
              className={`group relative h-56 overflow-hidden rounded-bento border transition-all duration-500 ease-out sm:h-64 ${
                isActive
                  ? 'border-accent sm:flex-[2.2]'
                  : activeIndex !== null
                  ? 'border-white/10 opacity-70 sm:flex-1'
                  : 'border-white/10 sm:flex-1 hover:border-white/30'
              }`}
            >
              {/* Background Glow when hovered */}
              {isActive && (
                <GlowEffect
                  colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                  mode="static"
                  blur="medium"
                />
              )}

              {/* Photo Image */}
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300" />

              {/* Header Badge */}
              <div className="absolute left-3.5 top-3.5 flex items-center gap-2 z-10">
                <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-cyber backdrop-blur-md">
                  {p.tag}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 z-10">
                <span className="font-display text-[11px] font-bold text-accent">
                  0{i + 1}
                </span>
                <h4 className="font-display text-base font-bold text-white transition-colors duration-300 group-hover:text-cyber">
                  {p.title}
                </h4>
                <p className="mt-1 text-xs leading-snug text-white/80 line-clamp-2">
                  {p.caption}
                </p>
              </div>

              {/* Zoom hint button */}
              <span className="absolute right-3 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                <Maximize2 size={14} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SportsMosaic;
