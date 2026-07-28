import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import categoryApi from '../../api/category.api.js';
import { PageHeader, Card, Button, FormField, Input, Textarea, Select, Switch } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';
import { slugify } from '../../lib/format.js';

const empty = {
  name: '', slug: '', parentId: '', description: '', image: '', banner: '', icon: '',
  sortOrder: 0, featured: false, status: true,
  seoTitle: '', seoDescription: '', seoKeywords: '',
};

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoryApi.getAll().then((data) => setCategories(Array.isArray(data) ? data : data?.items || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isEdit) {
      categoryApi.getOne(id).then((data) => { setValues({ ...empty, ...data }); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!values.name?.trim()) errs.name = 'Category name is required';
    if (!values.slug?.trim()) errs.slug = 'Slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) { await categoryApi.update(id, values); toast.success('Category updated'); }
      else { await categoryApi.create(values); toast.success('Category created'); }
      navigate('/categories');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading category…" />;

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={isEdit ? 'Edit Category' : 'Add Category'}
        breadcrumbs={[{ label: 'Categories', to: '/categories' }, { label: isEdit ? 'Edit' : 'New' }]}
        actions={<>
          <Button type="button" variant="secondary" onClick={() => navigate('/categories')}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Category</Button>
        </>}
      />

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-5">
          <Card title="Category Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category Name" required error={errors.name} className="col-span-2 sm:col-span-1">
                <Input value={values.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} placeholder="e.g. Virgin Hair" />
              </FormField>
              <FormField label="Slug" required error={errors.slug} className="col-span-2 sm:col-span-1">
                <Input value={values.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} placeholder="virgin-hair" />
              </FormField>
              <FormField label="Parent Category" className="col-span-2 sm:col-span-1" hint="Leave blank for a top-level (root) category">
                <Select value={values.parentId} onChange={(e) => set('parentId', e.target.value)}>
                  <option value="">— Root Category —</option>
                  {categories.filter((c) => (c._id || c.id) !== id).map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Sort Order" className="col-span-2 sm:col-span-1">
                <Input type="number" value={values.sortOrder} onChange={(e) => set('sortOrder', e.target.valueAsNumber || 0)} />
              </FormField>
              <FormField label="Description" className="col-span-2">
                <Textarea value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="Short description shown on the category page" />
              </FormField>
            </div>
          </Card>

          <Card title="SEO">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SEO Title" className="col-span-2">
                <Input value={values.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
              </FormField>
              <FormField label="SEO Description" className="col-span-2">
                <Textarea rows={3} value={values.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} />
              </FormField>
              <FormField label="SEO Keywords" className="col-span-2" hint="Comma-separated">
                <Input value={values.seoKeywords} onChange={(e) => set('seoKeywords', e.target.value)} />
              </FormField>
            </div>
          </Card>
        </div>

        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Category Image">
            <SingleImageUpload value={values.image} onChange={(v) => set('image', v)} label="Image" />
          </Card>
          <Card title="Banner Image">
            <SingleImageUpload value={values.banner} onChange={(v) => set('banner', v)} label="Banner" aspect="aspect-[16/7]" />
          </Card>
          <Card title="Icon">
            <SingleImageUpload value={values.icon} onChange={(v) => set('icon', v)} label="Icon" />
          </Card>
          <Card title="Visibility">
            <div className="flex flex-col gap-3">
              <Switch checked={values.featured} onChange={(v) => set('featured', v)} label="Featured Category" />
              <Switch checked={values.status} onChange={(v) => set('status', v)} label="Active" />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
