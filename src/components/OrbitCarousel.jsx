import { useCallback, useEffect, useRef, useState } from 'react';
import './OrbitCarousel.css';

// A 3D ring of cards that slowly orbits, can be dragged/flicked, and snaps a clicked card to the front.
// Pass `image` on an item to show a real screenshot; otherwise a styled mock site preview is drawn.
function OrbitCarousel({
  items,
  speed = 6, // degrees per second while idle
  tilt = -12, // ring tilt in degrees (rotateZ)
  pitch = -6, // camera pitch in degrees (rotateX)
  cardRatio = 0.64, // height / width
  onSelect,
}) {
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const cardRefs = useRef([]);
  const angle = useRef(0);
  const velocity = useRef(0);
  const target = useRef(null);
  const drag = useRef(null);
  const hovering = useRef(false);
  const [cardWidth, setCardWidth] = useState(320);
  const [active, setActive] = useState(0);

  const count = items.length;
  const step = 360 / count;
  // Radius that keeps neighbouring cards from overlapping, with a little breathing room.
  const radius = Math.round((cardWidth * 1.08) / (2 * Math.tan(Math.PI / count)));

  // Size cards relative to the stage so the ring fits any screen.
  useEffect(() => {
    const stage = stageRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setCardWidth(Math.round(Math.min(380, Math.max(180, w * 0.3))));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Animation loop: writes transforms directly so React doesn't re-render every frame.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (target.current !== null) {
        const diff = target.current - angle.current;
        angle.current += diff * Math.min(1, dt * 6);
        if (Math.abs(diff) < 0.05) target.current = null;
      } else if (!drag.current) {
        const idle = reduceMotion || hovering.current ? 0 : -speed;
        velocity.current += (idle - velocity.current) * Math.min(1, dt * 2);
        angle.current += velocity.current * dt;
      }

      ringRef.current.style.transform =
        `translateZ(${-radius}px) rotateX(${pitch}deg) rotateZ(${tilt}deg) rotateY(${angle.current}deg)`;

      // Fade and dim cards as they turn away from the viewer.
      let front = 0;
      let best = -2;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const facing = Math.cos(((i * step + angle.current) * Math.PI) / 180);
        if (facing > best) {
          best = facing;
          front = i;
        }
        card.style.opacity = Math.max(0, (facing + 0.35) / 1.35).toFixed(3);
        card.style.filter = `brightness(${(0.45 + 0.55 * Math.max(0, facing)).toFixed(3)})`;
        card.style.pointerEvents = facing > 0.2 ? 'auto' : 'none';
      });
      setActive((prev) => (prev === front ? prev : front));

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [radius, pitch, tilt, speed, step]);

  // Rotate the shortest way so card `index` faces the viewer.
  const focus = useCallback(
    (index) => {
      const desired = -index * step;
      const turns = Math.round((angle.current - desired) / 360);
      target.current = desired + turns * 360;
      velocity.current = 0;
    },
    [step]
  );

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, angle: angle.current, t: performance.now(), moved: 0 };
    target.current = null;
    stageRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const now = performance.now();
    const next = d.angle + dx * 0.25;
    velocity.current = ((next - angle.current) / Math.max(1, now - d.t)) * 1000;
    angle.current = next;
    d.t = now;
    d.moved = Math.max(d.moved, Math.abs(dx));
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (stageRef.current.hasPointerCapture(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId);
    }
    // A press without movement counts as a click on the card under the pointer.
    if (d && d.moved < 5) {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-index]');
      if (el) {
        const index = Number(el.dataset.index);
        focus(index);
        onSelect?.(items[index], index);
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') focus((active + 1) % count);
    if (e.key === 'ArrowLeft') focus((active - 1 + count) % count);
    if (e.key === 'Enter') onSelect?.(items[active], active);
  };

  return (
    <div className="orbit">
      <div
        ref={stageRef}
        className="orbit-stage"
        style={{ height: cardWidth * cardRatio * 2.4 }}
        tabIndex={0}
        role="listbox"
        aria-label="Project showcase. Use left and right arrow keys to browse."
        aria-activedescendant={`orbit-card-${active}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={() => (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        onKeyDown={onKeyDown}
      >
        <div className="orbit-glow" />
        <div ref={ringRef} className="orbit-ring">
          {items.map((item, i) => (
            <div
              key={item.title}
              id={`orbit-card-${i}`}
              ref={(el) => (cardRefs.current[i] = el)}
              className="orbit-card"
              data-index={i}
              role="option"
              aria-selected={i === active}
              style={{
                width: cardWidth,
                fontSize: cardWidth / 34, // mock preview text scales with the card
                height: cardWidth * cardRatio,
                marginLeft: -cardWidth / 2,
                marginTop: (-cardWidth * cardRatio) / 2,
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              }}
            >
              {item.image ? (
                <img src={item.image} alt={item.title} draggable="false" />
              ) : (
                <SitePreview item={item} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="orbit-caption" aria-live="polite">
        <span className="orbit-tag">{items[active].tag}</span>
        <h3>{items[active].title}</h3>
      </div>
    </div>
  );
}

// Mock website preview drawn with CSS, used when an item has no screenshot.
function SitePreview({ item }) {
  return (
    <div className="site" style={{ '--bg': item.bg, '--fg': item.fg, '--accent': item.accent }}>
      <div className="site-nav">
        <strong>{item.title}</strong>
        <span />
        <span />
        <span />
        <em>{item.cta || 'Get started'}</em>
      </div>
      <div className="site-hero">
        <h4>{item.headline}</h4>
        <p>{item.subline}</p>
        <div className="site-buttons">
          <i />
          <i />
        </div>
      </div>
      <div className={`site-art site-art--${item.art || 'orb'}`} />
      <div className="site-strip">
        <b />
        <b />
        <b />
      </div>
    </div>
  );
}

export default OrbitCarousel;
