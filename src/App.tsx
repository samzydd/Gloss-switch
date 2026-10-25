import { useState } from 'react';
import { SegmentedControl } from '@sakaniui/react';
import { GlossSwitch } from './GlossSwitch';

const SETTINGS = [
  { id: 'quiet', label: 'Quiet hours', description: 'Mute alerts from 10 pm to 7 am.', on: true },
  { id: 'sync', label: 'Auto-sync', description: 'Back up changes every 15 minutes.', on: true },
  { id: 'offline', label: 'Offline mode', description: 'Keep recent projects available without a connection.', on: false },
  { id: 'beta', label: 'Beta features', description: 'Try new tools before they ship to everyone.', on: false },
];

export function App() {
  const [dark, setDark] = useState(false);
  const [focus, setFocus] = useState(true);
  const [vals, setVals] = useState<Record<string, boolean>>(() => Object.fromEntries(SETTINGS.map((s) => [s.id, s.on])));
  const count = Object.values(vals).filter(Boolean).length + 1;

  return (
    <div className={`stage ${dark ? 'dark' : ''}`}>
      <div className="bar">
        <div>
          <h1>Gloss Switch</h1>
          <p>Click, press Space, or drag the knob. Same API as the Sakani Switch.</p>
        </div>
        <SegmentedControl
          options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
          value={dark ? 'dark' : 'light'}
          onChange={(v: string) => setDark(v === 'dark')}
        />
      </div>

      <div className="grid">
        <section className="card hero" aria-label="Hero">
          <span className="tag">XL</span>
          <GlossSwitch size="xl" checked={focus} onChange={(e) => setFocus(e.target.checked)} aria-label="Focus mode" />
          <div className="hero-copy">
            <strong>Focus mode</strong>
            <span>{focus ? 'Notifications are paused until you turn this off.' : 'Notifications are coming through as usual.'}</span>
          </div>
        </section>

        <section className="card" aria-label="Sizes">
          <span className="tag">Sizes</span>
          <div className="sizes">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <div className="size" key={s}>
                <GlossSwitch size={s} defaultChecked={s !== 'md'} aria-label={`${s} switch`} />
                <code>{s}</code>
              </div>
            ))}
            <div className="size">
              <GlossSwitch size="lg" disabled defaultChecked aria-label="disabled on" />
              <code>disabled</code>
            </div>
            <div className="size">
              <GlossSwitch size="lg" disabled aria-label="disabled off" />
              <code>disabled</code>
            </div>
          </div>
        </section>

        <section className="card" aria-label="Settings">
          <span className="tag">{count} of {SETTINGS.length + 1} on</span>
          <h2>Workspace settings</h2>
          <div className="list">
            {SETTINGS.map((s) => (
              <div className="row-item" key={s.id}>
                <GlossSwitch
                  size="md"
                  label={s.label}
                  description={s.description}
                  checked={vals[s.id]}
                  onChange={(e) => setVals((v) => ({ ...v, [s.id]: e.target.checked }))}
                />
              </div>
            ))}
            <div className="row-item">
              <GlossSwitch size="md" label="Single sign-on" description="Available on the Business plan." defaultChecked disabled />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
