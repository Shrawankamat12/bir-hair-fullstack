import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import blogApi from '../../api/blog.api.js';
import { PageHeader, Card, Button, FormField, Input, Textarea, Select, Switch, TagInput } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';
import { slugify } from '../../lib/format.js';

const CATEGORY_OPTIONS = ['Hair Care', 'Education', 'Styling Tips', 'News', 'Customer Stories'];

const empty = {
  title: '', slug: '', category: 'Hair Care', tags: [], excerpt: '', content: '',
  image: '', seoTitle: '', seoDescription: '', isPublished: true,
};

export default function BlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) blogApi.getOne(id).then((data) => { setValues({ ...empty, ...data }); setLoading(false); }).catch(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.title?.trim()) errs.title = 'Title is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      if (isEdit) { await blogApi.update(id, values); toast.success('Blog post updated'); }
      else { await blogApi.create(values); toast.success('Blog post created'); }
      navigate('/blogs');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save blog post');
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading post…" />;

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={isEdit ? 'Edit Blog Post' : 'Add Blog Post'}
        breadcrumbs={[{ label: 'Blog', to: '/blogs' }, { label: isEdit ? 'Edit' : 'New' }]}
        actions={<>
          <Button type="button" variant="secondary" onClick={() => navigate('/blogs')}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Post</Button>
        </>}
      />
      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-5">
          <Card>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Title" required error={errors.title} className="col-span-2">
                <Input value={values.title} onChange={(e) => { set('title', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} />
              </FormField>
              <FormField label="Slug" className="col-span-2 sm:col-span-1">
                <Input value={values.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} />
              </FormField>
              <FormField label="Category" className="col-span-2 sm:col-span-1">
                <Select value={values.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormField>
              <FormField label="Tags" className="col-span-2">
                <TagInput value={values.tags} onChange={(v) => set('tags', v)} />
              </FormField>
              <FormField label="Excerpt" className="col-span-2">
                <Textarea rows={2} value={values.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
              </FormField>
              <FormField label="Content" className="col-span-2">
                <Textarea rows={12} value={values.content} onChange={(e) => set('content', e.target.value)} />
              </FormField>
            </div>
          </Card>
          <Card title="SEO">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SEO Title" className="col-span-2"><Input value={values.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></FormField>
              <FormField label="SEO Description" className="col-span-2"><Textarea rows={3} value={values.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} /></FormField>
            </div>
          </Card>
        </div>
        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Featured Image">
            <SingleImageUpload value={values.image} onChange={(v) => set('image', v)} label="Image" aspect="aspect-[4/3]" />
          </Card>
          <Card title="Publish">
            <Switch checked={values.isPublished} onChange={(v) => set('isPublished', v)} label="Published" />
          </Card>
        </div>
      </div>
    </form>
  );
}
