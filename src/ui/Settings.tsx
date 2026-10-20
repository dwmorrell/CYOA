import { DEFAULT_PREFS, clampPrefs, type ReadingPrefs } from '../engine/persistence';
import { BackBar, Page } from './common';
import { useApp } from './context';

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <span className="stepper-label">{label}</span>
      <button type="button" className="btn small" aria-label={`${label}: smaller`} onClick={onMinus}>
        −
      </button>
      <output className="stepper-value">{value}</output>
      <button type="button" className="btn small" aria-label={`${label}: bigger`} onClick={onPlus}>
        +
      </button>
    </div>
  );
}

function Radios<K extends 'font' | 'theme'>({ name, legend, value, options, onChange }: { name: K; legend: string; value: ReadingPrefs[K]; options: [ReadingPrefs[K], string][]; onChange: (v: ReadingPrefs[K]) => void }) {
  return (
    <fieldset className="radio-row">
      <legend>{legend}</legend>
      {options.map(([v, text]) => (
        <label key={v} className="radio">
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span className={name === 'font' ? `font-sample font-${v}` : undefined}>{text}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Settings() {
  const { prefs, setPrefs, child } = useApp();
  const update = (patch: Partial<ReadingPrefs>) => setPrefs(clampPrefs({ ...prefs, ...patch }));
  const toggle = (key: 'lineFocus' | 'readAloud' | 'wordHelp', text: string) => (
    <label className="toggle">
      <input type="checkbox" checked={prefs[key]} onChange={(e) => update({ [key]: e.target.checked })} />
      <span>{text}</span>
    </label>
  );
  // Settings update in place (no re-mount), so focus stays on the control being used.
  return (
    <Page title="Reading settings" nav={<BackBar />}>
      <p className="muted">Settings for {child.name}. They are saved on this device.</p>
      <section className="prefs" aria-label="Settings">
        <p className="sample-text">The fox can see the ship by the dock.</p>
        <p className="visually-hidden" role="status" aria-live="polite">
          Text size {Math.round(prefs.fontScale * 100)} percent, line spacing {prefs.lineHeight.toFixed(1)}, letter spacing {prefs.letterSpacing.toFixed(2)}
        </p>
        <Stepper label="Text size" value={`${Math.round(prefs.fontScale * 100)}%`} onMinus={() => update({ fontScale: prefs.fontScale - 0.1 })} onPlus={() => update({ fontScale: prefs.fontScale + 0.1 })} />
        <Stepper label="Line spacing" value={prefs.lineHeight.toFixed(1)} onMinus={() => update({ lineHeight: prefs.lineHeight - 0.2 })} onPlus={() => update({ lineHeight: prefs.lineHeight + 0.2 })} />
        <Stepper label="Letter spacing" value={prefs.letterSpacing.toFixed(2)} onMinus={() => update({ letterSpacing: prefs.letterSpacing - 0.02 })} onPlus={() => update({ letterSpacing: prefs.letterSpacing + 0.02 })} />
        <Radios
          name="font"
          legend="Letters"
          value={prefs.font}
          onChange={(font) => update({ font })}
          options={[
            ['system', 'Plain'],
            ['dyslexic', 'OpenDyslexic'],
            ['rounded', 'Rounded'],
            ['serif', 'Book'],
          ]}
        />
        <Radios
          name="theme"
          legend="Page colour"
          value={prefs.theme}
          onChange={(theme) => update({ theme })}
          options={[
            ['cream', 'Cream'],
            ['blue', 'Soft blue'],
            ['grey', 'Grey'],
            ['dark', 'Dark'],
          ]}
        />
        {toggle('wordHelp', 'Word help: tap marked words for syllables and meanings')}
        {toggle('readAloud', 'Show the "Read to me" button')}
        {toggle('lineFocus', 'Highlight one paragraph at a time')}
        <button type="button" className="btn" onClick={() => setPrefs({ ...DEFAULT_PREFS })}>
          Reset settings
        </button>
      </section>
    </Page>
  );
}
