import { forwardRef, useId, useRef, useState } from 'react';
import type { InputHTMLAttributes, PointerEvent as RPointerEvent, ReactNode } from 'react';
import './GlossSwitch.css';

export interface GlossSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional label rendered to the right of the switch. */
  label?: string;
  /** Help text under the label, left-aligned with it. */
  description?: ReactNode;
  /** Text inside the track when on. Hidden at `sm`. Default `ON`. */
  onLabel?: string;
  /** Text inside the track when off. Hidden at `sm`. Default `OFF`. */
  offLabel?: string;
  /**
   * Overall size. The switch is sized in `em`, so it scales as one piece.
   * `sm` 28px high, `md` 40px (default), `lg` 64px, `xl` 120px.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Controlled value. Pair it with `onChange`. */
  checked?: boolean;
  /** Initial value when uncontrolled. */
  defaultChecked?: boolean;
  /** Fires with the native change event, for clicks, Space and drags alike. */
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  /** Dims the switch and ignores all input. */
  disabled?: boolean;
}

/**
 * GlossSwitch: a tactile pill switch.
 *
 * - A raised casing, a recessed track (neutral when off, a deep green well when on) and a
 *   domed knob with a faint compass engraved on it. The needle points west when off and
 *   east when on, and follows the knob live while it is dragged.
 * - Same contract as the Sakani `Switch`: a real checkbox with `role="switch"`, so it
 *   works in forms, controlled or uncontrolled, with a visible keyboard focus ring.
 * - Interaction: click, Space, or drag the knob. A drag that ends past halfway commits the
 *   change; a shorter one springs back. While pressed the whole switch sinks slightly and
 *   the knob stretches a touch in the direction it will travel.
 * - Theming: Sakani UI tokens plus local custom properties; add a `dark` class on any
 *   ancestor for the dark theme. Motion respects `prefers-reduced-motion`.
 */
export const GlossSwitch = forwardRef<HTMLInputElement, GlossSwitchProps>(function GlossSwitch(
  { label, description, onLabel = 'ON', offLabel = 'OFF', size = 'md', className, checked, defaultChecked, onChange, disabled, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const [inner, setInner] = useState(!!defaultChecked);
  const on = checked ?? inner;
  const input = useRef<HTMLInputElement | null>(null);
  const track = useRef<HTMLSpanElement>(null);
  const [drag, setDrag] = useState<number | null>(null); // live 0..1 while dragging
  const [pressed, setPressed] = useState(false);
  const gesture = useRef<{ x: number; p0: number; moved: boolean; w: number } | null>(null);
  const suppress = useRef(false);

  const setRefs = (el: HTMLInputElement | null) => {
    input.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const onPointerDown = (e: RPointerEvent<HTMLSpanElement>) => {
    if (disabled || e.button > 0) return;
    const w = track.current?.getBoundingClientRect().width ?? 1;
    gesture.current = { x: e.clientX, p0: on ? 1 : 0, moved: false, w };
    setPressed(true);
  };
  const onPointerMove = (e: RPointerEvent<HTMLSpanElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (!g.moved && Math.abs(dx) > 4) {
      g.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (g.moved) {
      // the knob travels about half the track width
      const travel = g.w * 0.5;
      setDrag(Math.min(1, Math.max(0, g.p0 + dx / travel)));
    }
  };
  const end = () => {
    const g = gesture.current;
    gesture.current = null;
    setPressed(false);
    if (g?.moved) {
      suppress.current = true; // the click that follows a drag must not toggle again
      setTimeout(() => (suppress.current = false), 0);
      const want = (drag ?? g.p0) > 0.5;
      setDrag(null);
      if (want !== on) input.current?.click();
    }
  };

  const p = drag ?? (on ? 1 : 0);

  return (
    <label
      className={`gsw gsw--${size} ${disabled ? 'is-disabled' : ''} ${className ?? ''}`}
      htmlFor={inputId}
      onClickCapture={(e) => {
        if (suppress.current) e.preventDefault();
      }}
    >
      <input
        {...rest}
        ref={setRefs}
        id={inputId}
        type="checkbox"
        role="switch"
        className="gsw-input"
        checked={on}
        disabled={disabled}
        aria-checked={on}
        onChange={(e) => {
          setInner(e.target.checked);
          onChange?.(e);
        }}
      />
      <span
        ref={track}
        className={`gsw-ui ${drag !== null ? 'is-dragging' : ''} ${pressed ? 'is-pressed' : ''} ${on ? 'is-on' : ''}`}
        style={{ ['--p' as string]: p }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        aria-hidden="true"
      >
        <span className="gsw-track">
          <span className="gsw-text gsw-text--on">{onLabel}</span>
          <span className="gsw-text gsw-text--off">{offLabel}</span>
        </span>
        <span className="gsw-knob">
          {/* a faint compass engraved on the dome, its ring and ticks on the ball's edge; the needle points west when off and east when on */}
          <svg className="gsw-compass" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring" cx="50" cy="50" r="48" />
            <line className="major" x1="50.0" y1="10.5" x2="50.0" y2="2.5" />
            <line className="minor" x1="80.4" y1="19.6" x2="83.6" y2="16.4" />
            <line className="major" x1="89.5" y1="50.0" x2="97.5" y2="50.0" />
            <line className="minor" x1="80.4" y1="80.4" x2="83.6" y2="83.6" />
            <line className="major" x1="50.0" y1="89.5" x2="50.0" y2="97.5" />
            <line className="minor" x1="19.6" y1="80.4" x2="16.4" y2="83.6" />
            <line className="major" x1="10.5" y1="50.0" x2="2.5" y2="50.0" />
            <line className="minor" x1="19.6" y1="19.6" x2="16.4" y2="16.4" />
            <g className="needle">
              <polygon className="north" points="50,14 56,50 44,50" />
              <polygon className="south" points="50,86 56,50 44,50" />
            </g>
            <circle className="hub" cx="50" cy="50" r="3.4" />
          </svg>
        </span>
      </span>
      {(label || description) && (
        <span className="gsw-copy">
          {label && <span className="gsw-label">{label}</span>}
          {description && <span className="gsw-desc">{description}</span>}
        </span>
      )}
    </label>
  );
});
