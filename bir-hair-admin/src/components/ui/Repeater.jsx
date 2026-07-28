import Button from './Button.jsx';
import { FormField, Input, Textarea } from './FormControls.jsx';

export function Repeater({ items = [], onChange, fields, addLabel = '+ Add item', emptyLabel = 'No items yet.' }) {
  const update = (idx, key, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };
  const add = () => onChange([...items, fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default ?? '' }), {})]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="border border-border-soft rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <FormField key={f.key} label={f.label} className={f.span === 2 ? 'col-span-2' : ''}>
                {f.type === 'textarea'
                  ? <Textarea rows={2} value={item[f.key] || ''} onChange={(e) => update(idx, f.key, e.target.value)} placeholder={f.placeholder} />
                  : <Input value={item[f.key] || ''} onChange={(e) => update(idx, f.key, e.target.value)} placeholder={f.placeholder} />}
              </FormField>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => move(idx, -1)} className="text-xs text-ink-faint hover:text-ink">Move up</button>
            <button type="button" onClick={() => move(idx, 1)} className="text-xs text-ink-faint hover:text-ink">Move down</button>
            <button type="button" onClick={() => remove(idx)} className="text-xs text-danger font-semibold ml-auto">Remove</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-ink-faint py-1">{emptyLabel}</p>}
      <Button type="button" size="sm" variant="secondary" onClick={add}>{addLabel}</Button>
    </div>
  );
}

export function OrderList({ items = [], labels = {}, onChange }) {
  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((key, idx) => (
        <div key={key} className="flex items-center gap-3 border border-border-soft rounded-lg px-3 py-2">
          <span className="text-xs text-ink-faint w-6">{idx + 1}.</span>
          <span className="text-[13px] font-medium flex-1">{labels[key] || key}</span>
          <button type="button" onClick={() => move(idx, -1)} className="text-xs text-ink-faint hover:text-ink">Up</button>
          <button type="button" onClick={() => move(idx, 1)} className="text-xs text-ink-faint hover:text-ink">Down</button>
        </div>
      ))}
    </div>
  );
}
