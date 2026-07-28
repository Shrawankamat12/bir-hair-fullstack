import { useEffect, useState } from 'react';
import { Modal, Button, FormField, Input, Textarea, Select, Switch, TagInput } from '../ui/index.js';
import { SingleImageUpload, GalleryUpload, VideoField } from '../ui/ImageUpload.jsx';
import { slugify } from '../../lib/format.js';

/**
 * fields: [{ name, label, type, required, options, span, placeholder, hint, autoSlugFrom }]
 * type: text | textarea | number | select | image | gallery | video | switch | tags | url | email
 */
export default function SimpleEntityForm({ open, onClose, onSubmit, title, fields, initialValues = {}, submitLabel = 'Save' }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setValues(initialValues); setErrors({}); } }, [open, initialValues]);

  const set = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const handleChange = (field, val) => {
    set(field.name, val);
    const auto = fields.find((f) => f.autoSlugFrom === field.name);
    if (auto && !values[auto.name + '__touched']) set(auto.name, slugify(val));
  };

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name] && values[f.name] !== 0) errs[f.name] = `${f.label} is required`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg" footer={
      <>
        <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
        <Button onClick={submit} loading={saving}>{submitLabel}</Button>
      </>
    }>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        {fields.map((f) => {
          const span = f.span === 2 || f.type === 'textarea' || f.type === 'gallery' ? 'col-span-2' : 'col-span-2 sm:col-span-1';
          const val = values[f.name] ?? (f.type === 'gallery' ? [] : f.type === 'tags' ? [] : f.type === 'switch' ? false : '');
          return (
            <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name]} hint={f.hint} className={span}>
              {f.type === 'textarea' && <Textarea value={val} onChange={(e) => handleChange(f, e.target.value)} placeholder={f.placeholder} error={errors[f.name]} />}
              {f.type === 'select' && (
                <Select value={val} onChange={(e) => handleChange(f, e.target.value)} error={errors[f.name]}>
                  <option value="">Select…</option>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              )}
              {f.type === 'number' && <Input type="number" value={val} onChange={(e) => handleChange(f, e.target.valueAsNumber ?? e.target.value)} placeholder={f.placeholder} error={errors[f.name]} />}
              {f.type === 'switch' && <Switch checked={!!val} onChange={(v) => set(f.name, v)} label={f.switchLabel || 'Enabled'} />}
              {f.type === 'image' && <SingleImageUpload value={val} onChange={(v) => set(f.name, v)} label={f.label} />}
              {f.type === 'gallery' && <GalleryUpload images={val} onChange={(v) => set(f.name, v)} />}
              {f.type === 'video' && <VideoField value={val} onChange={(v) => set(f.name, v)} />}
              {f.type === 'tags' && <TagInput value={val} onChange={(v) => set(f.name, v)} placeholder={f.placeholder} />}
              {(!f.type || ['text', 'url', 'email'].includes(f.type)) && (
                <Input type={f.type === 'text' || !f.type ? 'text' : f.type} value={val} onChange={(e) => handleChange(f, e.target.value)} placeholder={f.placeholder} error={errors[f.name]} />
              )}
            </FormField>
          );
        })}
      </form>
    </Modal>
  );
}
