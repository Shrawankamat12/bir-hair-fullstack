import { useNavigate } from "react-router-dom";
import categoryApi from "../../api/category.api.js";
import useEntityList from "../../hooks/useEntityList.js";
import EntityListPage from "../../components/crud/EntityListPage.jsx";
import { StatusBadge, Badge } from "../../components/ui/index.js";
import { resolveMediaUrl } from "../../lib/format.js";

export default function CategoryList() {
  const navigate = useNavigate();
  const entity = useEntityList(categoryApi, { searchKeys: ["name", "slug"] });

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image ? (
          <img
            src={resolveMediaUrl(r.image)}
            className="h-10 w-10 rounded-md object-cover border border-border-soft"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-surface-muted" />
        ),
    },
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (r) => (
        <span
          className="font-semibold cursor-pointer hover:text-brand-magenta"
          onClick={() => navigate(`/categories/${r._id || r.id}`)}
        >
          {r.name}
        </span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (r) => <code className="text-xs text-ink-faint">{r.slug}</code>,
    },
    {
      key: "parentName",
      label: "Parent Category",
      render: (r) =>
        r.parentName || <span className="text-ink-faint">— Root —</span>,
    },
    {
      key: "productCount",
      label: "Products",
      render: (r) => r.productCount ?? 0,
    },
    {
      key: "featured",
      label: "Featured",
      render: (r) => (r.featured ? <Badge tone="brand">Featured</Badge> : "—"),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status ? "active" : "inactive"} />,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—",
    },
  ];

  return (
    <EntityListPage
      title="Categories"
      subtitle="Organize the product catalog into browsable categories."
      entity={entity}
      columns={columns}
      onAdd={() => navigate("/categories/new")}
      addLabel="Add Category"
      onEdit={(row) => navigate(`/categories/${row._id || row.id}/edit`)}
      onView={(row) => navigate(`/categories/${row._id || row.id}`)}
      showExport={false}
      filterOptions={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ],
        },
      ]}
      statusOptions={[
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
      ]}
    />
  );
}
