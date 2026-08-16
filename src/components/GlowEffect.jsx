import React from 'react';
import './GlowEffect.css';

export function GlowEffect({
  colors = ['#0894FF', '#C959DD', '#FF2E54', '#FF9004'],
  mode = 'static',
  blur = 'medium',
  duration = 4,
  scale = 1,
  className = '',
  style = {}
}) {
  const getBlurPx = (val) => {
    if (typeof val === 'number') return `${val}px`;
    switch (val) {
      case 'soft':
        return '12px';
      case 'medium':
        return '20px';
      case 'strong':
        return '32px';
      default:
        return '20px';
    }
  };

  const blurPx = getBlurPx(blur);
  const colorList = Array.isArray(colors) && colors.length > 0 ? colors : ['#0894FF', '#C959DD', '#FF2E54', '#FF9004'];
  const gradientString = `conic-gradient(from 0deg at 50% 50%, ${colorList.join(', ')}, ${colorList[0]})`;

  let modeClass = '';
  if (mode === 'rotate') modeClass = 'glow-effect-rotate';
  else if (mode === 'pulse') modeClass = 'glow-effect-pulse';
  else if (mode === 'breathe') modeClass = 'glow-effect-breathe';

  return (
    <div className={`glow-effect-container ${className}`.trim()} style={style} aria-hidden="true">
      <div
        className={`glow-effect-bg ${modeClass}`.trim()}
        style={{
          background: gradientString,
          filter: `blur(${blurPx})`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          '--glow-duration': `${duration}s`
        }}
      />
    </div>
  );
}

export default GlowEffect;
