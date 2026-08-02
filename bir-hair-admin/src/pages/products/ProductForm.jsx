import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productApi from "../../api/product.api.js";
import categoryApi from "../../api/category.api.js";
import subcategoryApi from "../../api/subcategory.api.js";
import collectionApi from "../../api/collection.api.js";
import brandApi from "../../api/brand.api.js";
import attributeApi from "../../api/attribute.api.js";
import {
  PageHeader,
  Card,
  Button,
  Tabs,
  FormField,
  Input,
  Textarea,
  Select,
  Switch,
  TagInput,
} from "../../components/ui/index.js";
import { GalleryUpload, VideoField } from "../../components/ui/ImageUpload.jsx";
import { PageLoader, useToast } from "../../components/ui/Feedback.jsx";
import { slugify } from "../../lib/format.js";

const empty = {
  name: "",
  sku: "",
  slug: "",
  categoryId: "",
  subcategoryId: "",
  collectionId: "",
  brandId: "",
  hairType: "",
  hairTexture: "",
  hairLength: "",
  hairColour: "",
  hairDensity: "",
  hairOrigin: "",
  weight: "",
  price: "",
  discountPrice: "",
  costPrice: "",
  stock: 0,
  minStock: 5,
  status: true,
  featured: false,
  // --- Homepage / merchandising flags ---
  newArrival: false,
  trending: false,
  premium: false,
  bestSeller: false,
  flashSale: false,
  flashSaleEndsAt: "",
  recommended: false,
  saleBadgeText: "",
  tags: [],
  visibility: "visible",
  gallery: [],
  video: "",
  description: "",
  specifications: "",
  careInstructions: "",
  shippingInfo: "",
  returnPolicy: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  hasVariants: false,
  variants: [],
};

const TABS = [
  { value: "general", label: "General" },
  { value: "flags", label: "Visibility & Flags" },
  { value: "attributes", label: "Hair Attributes" },
  { value: "pricing", label: "Pricing & Inventory" },
  { value: "variants", label: "Variants" },
  { value: "media", label: "Media" },
  { value: "shipping", label: "Shipping & Policy" },
  { value: "seo", label: "SEO" },
];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("general");
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    Promise.all([
      categoryApi.getAll().catch(() => []),
      subcategoryApi.getAll().catch(() => []),
      collectionApi.getAll().catch(() => []),
      brandApi.getAll().catch(() => []),
      attributeApi.getAll().catch(() => []),
    ]).then(([cats, subcats, cols, brs, attrs]) => {
      setCategories(cats?.items || cats || []);
      setSubcategories(subcats?.items || subcats || []);
      setCollections(cols?.items || cols || []);
      setBrands(brs?.items || brs || []);
      setAttributes(attrs?.items || attrs || []);
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      productApi
        .getOne(id)
        .then((data) => {
          const flashSaleEndsAt = data.flashSaleEndsAt
            ? new Date(data.flashSaleEndsAt).toISOString().slice(0, 16)
            : "";
          // Backend returns category/subCategory/collection/brand (possibly
          // populated as objects). The form binds to *Id fields, so extract
          // the id whether it comes back as a string or a populated object.
          const idOf = (val) =>
            val && typeof val === "object" ? val._id || val.id || "" : val || "";

          setValues({
            ...empty,
            ...data,
            categoryId: idOf(data.category) || data.categoryId || "",
            subcategoryId:
              idOf(data.subcategory) || data.subcategoryId || "",
            collectionId: idOf(data.collectionRef) || data.collectionId || "",
            brandId: idOf(data.brand) || data.brandId || "",
            // Schema has no "status" field — it's isActive.
            status: data.isActive ?? true,
            // Form's "Price (MRP)" field maps to the schema's required "mrp".
            // Fall back to data.price for older records saved before this fix.
            price: data.mrp ?? data.price ?? "",
            flashSaleEndsAt,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const attrsByType = (type) => attributes.filter((a) => a.type === type);

  const validate = () => {
    const errs = {};
    if (!values.name?.trim()) errs.name = "Product name is required";
    if (!values.sku?.trim()) errs.sku = "SKU is required";
    if (!values.categoryId) errs.categoryId = "Category is required";
    if (values.price === "" || values.price == null)
      errs.price = "Price is required";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTab(
        errs.name || errs.sku
          ? "general"
          : errs.categoryId
            ? "general"
            : "pricing",
      );
    }
    return Object.keys(errs).length === 0;
  };

  // Cleans form values into the shape the backend schema expects:
  // - empty-string ObjectId refs -> undefined (not "")
  // - numeric fields -> actual numbers, not strings
  // - empty date -> undefined instead of ""
  const buildPayload = (v) => {
    const toObjectIdOrUndefined = (val) => (val ? val : undefined);
    const toNumberOrUndefined = (val) =>
      val === "" || val == null ? undefined : Number(val);

    const {
      categoryId,
      subcategoryId,
      collectionId,
      brandId,
      status,
      ...rest
    } = v;

    const mrpValue = toNumberOrUndefined(v.price);
    const discountValue = toNumberOrUndefined(v.discountPrice);

    return {
      ...rest,
      // Backend field names differ from the form's *Id fields.
      category: toObjectIdOrUndefined(categoryId),
      subcategory: toObjectIdOrUndefined(subcategoryId),
      collectionRef: toObjectIdOrUndefined(collectionId),
      brand: toObjectIdOrUndefined(brandId),
      // Schema has no "status" field — it's isActive.
      isActive: Boolean(status),
      // Schema requires BOTH "mrp" and "price". The form's "Price (MRP)"
      // field is the mrp; the actual selling price is the discount price
      // if one is set, otherwise it equals the mrp.
      mrp: mrpValue,
      price: discountValue ?? mrpValue,
      discountPrice: discountValue,
      costPrice: toNumberOrUndefined(v.costPrice),
      stock: Number(v.stock) || 0,
      minStock: Number(v.minStock) || 0,
      flashSaleEndsAt:
        v.flashSale && v.flashSaleEndsAt ? v.flashSaleEndsAt : undefined,
      variants: (v.variants || []).map((variant) => ({
        ...variant,
        price: toNumberOrUndefined(variant.price),
        stock: Number(variant.stock) || 0,
      })),
    };
  };

  // Pulls the real field-level messages out of a backend validation error
  // so the toast tells you exactly which field failed and why.
  // Handles both shapes: errors as an array of {field, message} / strings,
  // or errors as an object keyed by field name (Mongoose default).
  const extractValidationMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Could not save product";

    if (Array.isArray(data.errors)) {
      const messages = data.errors
        .map((e) => {
          if (typeof e === "string") return e;
          const field = e?.path || e?.field || e?.param;
          const msg = e?.message || e?.msg;
          return field ? `${field}: ${msg}` : msg;
        })
        .filter(Boolean);
      if (messages.length) return messages.join(" · ");
    } else if (data.errors && typeof data.errors === "object") {
      const messages = Object.entries(data.errors).map(
        ([field, e]) => `${field}: ${e?.message || e}`,
      );
      if (messages.length) return messages.join(" · ");
    }
    return data.message || "Could not save product";
  };

  // Logs the full error as readable JSON text (not a collapsed console object)
  // so it can be copy-pasted in full for debugging.
  const logValidationError = (label, err) => {
    try {
      console.error(label, JSON.stringify(err?.response?.data, null, 2));
    } catch {
      console.error(label, err?.response?.data || err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = buildPayload(values);
      if (isEdit) {
        await productApi.update(id, payload);
        toast.success("Product updated");
      } else {
        await productApi.create(payload);
        toast.success("Product created");
      }
      navigate("/products");
    } catch (err) {
      logValidationError("Product save validation error:", err);
      toast.error(extractValidationMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!isEdit) return;
    const { _id, id: _id2, sku, slug, ...rest } = values;
    try {
      await productApi.create(
        buildPayload({
          ...rest,
          name: `${values.name} (Copy)`,
          sku: `${values.sku}-COPY`,
          slug: `${values.slug}-copy`,
        }),
      );
      toast.success("Product duplicated");
      navigate("/products");
    } catch (err) {
      logValidationError("Product duplicate validation error:", err);
      toast.error(extractValidationMessage(err));
    }
  };

  const addVariant = () =>
    set("variants", [
      ...values.variants,
      {
        length: "",
        colour: "",
        texture: "",
        weight: "",
        density: "",
        sku: "",
        price: "",
        stock: 0,
      },
    ]);
  const updateVariant = (idx, key, val) => {
    const next = [...values.variants];
    next[idx] = { ...next[idx], [key]: val };
    set("variants", next);
  };
  const removeVariant = (idx) =>
    set(
      "variants",
      values.variants.filter((_, i) => i !== idx),
    );

  if (loading) return <PageLoader label="Loading product…" />;

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Product" : "Add Product"}
        breadcrumbs={[
          { label: "Products", to: "/products" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <>
            {isEdit && (
              <Button type="button" variant="subtle" onClick={duplicate}>
                Duplicate
              </Button>
            )}
            {isEdit && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/products/${id}/preview`)}
              >
                Preview
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
            <Button type="button" loading={saving} onClick={submit}>
              Save Product
            </Button>
          </>
        }
      />

      <Card padded={false}>
        <div className="px-5 pt-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="px-5 pb-6">
          {tab === "general" && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              <FormField
                label="Product Name"
                required
                error={errors.name}
                className="col-span-2 sm:col-span-1"
              >
                <Input
                  value={values.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                />
              </FormField>
              <FormField
                label="SKU"
                required
                error={errors.sku}
                className="col-span-2 sm:col-span-1"
              >
                <Input
                  value={values.sku}
                  onChange={(e) => set("sku", e.target.value)}
                />
              </FormField>
              <FormField label="Slug" className="col-span-2 sm:col-span-1">
                <Input
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                />
              </FormField>
              <FormField
                label="Category"
                required
                error={errors.categoryId}
                className="col-span-2 sm:col-span-1"
              >
                <Select
                  value={values.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Sub Category"
                className="col-span-2 sm:col-span-1"
              >
                <Select
                  value={values.subcategoryId}
                  onChange={(e) => set("subcategoryId", e.target.value)}
                >
                  <option value="">Select sub-category</option>
                  {subcategories
                    .filter((s) => {
                      if (!values.categoryId) return true;
                      const subCat = s.category ?? s.categoryId;
                      const subCatId =
                        subCat && typeof subCat === "object"
                          ? subCat._id || subCat.id
                          : subCat;
                      return subCatId === values.categoryId;
                    })
                    .map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </FormField>
              <FormField
                label="Collection"
                className="col-span-2 sm:col-span-1"
              >
                <Select
                  value={values.collectionId}
                  onChange={(e) => set("collectionId", e.target.value)}
                >
                  <option value="">Select collection</option>
                  {collections.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Brand" className="col-span-2 sm:col-span-1">
                <Select
                  value={values.brandId}
                  onChange={(e) => set("brandId", e.target.value)}
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Description" className="col-span-2">
                <Textarea
                  rows={5}
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </FormField>
              <FormField
                label="Specifications"
                className="col-span-2"
                hint="One per line, e.g. Origin: India / Texture: Straight"
              >
                <Textarea
                  rows={4}
                  value={values.specifications}
                  onChange={(e) => set("specifications", e.target.value)}
                />
              </FormField>
              <div className="col-span-2 flex gap-6">
                <Switch
                  checked={values.status}
                  onChange={(v) => set("status", v)}
                  label="Active"
                />
              </div>
            </div>
          )}

          {tab === "flags" && (
            <div className="max-w-4xl flex flex-col gap-6">
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-3">
                  Homepage Shelves
                </p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <Switch
                    checked={values.featured}
                    onChange={(v) => set("featured", v)}
                    label="Featured"
                  />
                  <Switch
                    checked={values.newArrival}
                    onChange={(v) => set("newArrival", v)}
                    label="New Arrival"
                  />
                  <Switch
                    checked={values.trending}
                    onChange={(v) => set("trending", v)}
                    label="Trending"
                  />
                  <Switch
                    checked={values.premium}
                    onChange={(v) => set("premium", v)}
                    label="Premium"
                  />
                  <Switch
                    checked={values.bestSeller}
                    onChange={(v) => set("bestSeller", v)}
                    label="Best Seller"
                  />
                  <Switch
                    checked={values.flashSale}
                    onChange={(v) => set("flashSale", v)}
                    label="Flash Sale"
                  />
                  <Switch
                    checked={values.recommended}
                    onChange={(v) => set("recommended", v)}
                    label="Recommended"
                  />
                </div>
              </div>
              {values.flashSale && (
                <FormField
                  label="Flash Sale Ends At"
                  hint="Countdown timer on Home page uses this"
                  className="max-w-xs"
                >
                  <Input
                    type="datetime-local"
                    value={values.flashSaleEndsAt}
                    onChange={(e) => set("flashSaleEndsAt", e.target.value)}
                  />
                </FormField>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Visibility"
                  hint="Hidden products never appear on the storefront, even if Active"
                >
                  <Select
                    value={values.visibility}
                    onChange={(e) => set("visibility", e.target.value)}
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </Select>
                </FormField>
                <FormField
                  label="Sale Badge Text"
                  hint='Overrides the auto badge, e.g. "-20% Today"'
                >
                  <Input
                    value={values.saleBadgeText}
                    onChange={(e) => set("saleBadgeText", e.target.value)}
                  />
                </FormField>
              </div>
              <FormField
                label="Tags"
                hint="Press Enter to add. Used for search, related/similar products and filters."
              >
                <TagInput
                  value={values.tags}
                  onChange={(v) => set("tags", v)}
                  placeholder="e.g. curly, bridal, bestseller"
                />
              </FormField>
            </div>
          )}

          {tab === "attributes" && (
            <div className="grid grid-cols-3 gap-4 max-w-4xl">
              {[
                ["hairType", "Hair Type", "hairType"],
                ["hairTexture", "Hair Texture", "hairTexture"],
                ["hairLength", "Hair Length", "hairLength"],
                ["hairColour", "Hair Colour", "hairColour"],
                ["hairDensity", "Hair Density", "hairDensity"],
                ["hairOrigin", "Hair Origin", "hairOrigin"],
              ].map(([key, label, attrType]) => (
                <FormField key={key} label={label}>
                  <Select
                    value={values[key]}
                    onChange={(e) => set(key, e.target.value)}
                  >
                    <option value="">Select {label.toLowerCase()}</option>
                    {attrsByType(attrType).map((a) => (
                      <option key={a._id || a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              ))}
              <FormField label="Weight" hint="e.g. 100g">
                <Input
                  value={values.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="100g"
                />
              </FormField>
            </div>
          )}

          {tab === "pricing" && (
            <div className="grid grid-cols-3 gap-4 max-w-4xl">
              <FormField label="Price (MRP)" required error={errors.price}>
                <Input
                  type="number"
                  value={values.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </FormField>
              <FormField label="Discount Price">
                <Input
                  type="number"
                  value={values.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                />
              </FormField>
              <FormField
                label="Cost Price"
                hint="Internal only, not shown to customers"
              >
                <Input
                  type="number"
                  value={values.costPrice}
                  onChange={(e) => set("costPrice", e.target.value)}
                />
              </FormField>
              <FormField label="Stock Quantity">
                <Input
                  type="number"
                  value={values.stock}
                  onChange={(e) => set("stock", e.target.valueAsNumber || 0)}
                />
              </FormField>
              <FormField label="Minimum Stock (low-stock alert)">
                <Input
                  type="number"
                  value={values.minStock}
                  onChange={(e) => set("minStock", e.target.valueAsNumber || 0)}
                />
              </FormField>
            </div>
          )}

          {tab === "variants" && (
            <div>
              <div className="flex items-center justify-between mb-4 max-w-4xl">
                <Switch
                  checked={values.hasVariants}
                  onChange={(v) => set("hasVariants", v)}
                  label="This product has variants (length / colour / texture / weight / density)"
                />
                {values.hasVariants && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={addVariant}
                  >
                    + Add Variant
                  </Button>
                )}
              </div>
              {values.hasVariants && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">
                        {[
                          "Length",
                          "Colour",
                          "Texture",
                          "Weight",
                          "Density",
                          "SKU",
                          "Price",
                          "Stock",
                          "",
                        ].map((h) => (
                          <th key={h} className="px-2 py-2">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {values.variants.map((v, idx) => (
                        <tr key={idx} className="border-t border-border-soft">
                          {[
                            "length",
                            "colour",
                            "texture",
                            "weight",
                            "density",
                          ].map((k) => (
                            <td key={k} className="px-1 py-1.5">
                              <Input
                                value={v[k]}
                                onChange={(e) =>
                                  updateVariant(idx, k, e.target.value)
                                }
                                className="py-1.5 text-xs"
                              />
                            </td>
                          ))}
                          <td className="px-1 py-1.5">
                            <Input
                              value={v.sku}
                              onChange={(e) =>
                                updateVariant(idx, "sku", e.target.value)
                              }
                              className="py-1.5 text-xs"
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              value={v.price}
                              onChange={(e) =>
                                updateVariant(idx, "price", e.target.value)
                              }
                              className="py-1.5 text-xs w-20"
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              value={v.stock}
                              onChange={(e) =>
                                updateVariant(
                                  idx,
                                  "stock",
                                  e.target.valueAsNumber || 0,
                                )
                              }
                              className="py-1.5 text-xs w-16"
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="text-danger text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {values.variants.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-6 text-ink-faint text-xs"
                          >
                            No variants added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "media" && (
            <div className="max-w-4xl flex flex-col gap-6">
              <FormField label="Gallery Images">
                <GalleryUpload
                  images={values.gallery}
                  onChange={(v) => set("gallery", v)}
                />
              </FormField>
              <FormField
                label="Product Video"
                hint="YouTube / Vimeo / hosted MP4 URL"
              >
                <VideoField
                  value={values.video}
                  onChange={(v) => set("video", v)}
                />
              </FormField>
            </div>
          )}

          {tab === "shipping" && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              <FormField label="Shipping Information" className="col-span-2">
                <Textarea
                  rows={4}
                  value={values.shippingInfo}
                  onChange={(e) => set("shippingInfo", e.target.value)}
                  placeholder="Dispatch time, packaging, carrier details…"
                />
              </FormField>
              <FormField label="Care Instructions" className="col-span-2">
                <Textarea
                  rows={4}
                  value={values.careInstructions}
                  onChange={(e) => set("careInstructions", e.target.value)}
                />
              </FormField>
              <FormField label="Return Policy" className="col-span-2">
                <Textarea
                  rows={4}
                  value={values.returnPolicy}
                  onChange={(e) => set("returnPolicy", e.target.value)}
                />
              </FormField>
            </div>
          )}

          {tab === "seo" && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              <FormField label="SEO Title" className="col-span-2">
                <Input
                  value={values.seoTitle}
                  onChange={(e) => set("seoTitle", e.target.value)}
                />
              </FormField>
              <FormField label="SEO Description" className="col-span-2">
                <Textarea
                  rows={3}
                  value={values.seoDescription}
                  onChange={(e) => set("seoDescription", e.target.value)}
                />
              </FormField>
              <FormField
                label="SEO Keywords"
                className="col-span-2"
                hint="Comma-separated"
              >
                <Input
                  value={values.seoKeywords}
                  onChange={(e) => set("seoKeywords", e.target.value)}
                />
              </FormField>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}