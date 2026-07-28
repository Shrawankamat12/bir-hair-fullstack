import DataTable from "../DataTable.jsx";
import {
  PageHeader,
  Card,
  Pagination,
  Button,
  Select,
  Input,
} from "../ui/index.js";
import { exportToCsv } from "../../lib/exportCsv.js";
import { exportToExcel } from "../../lib/exportExcel.js";
import { printTable } from "../../lib/print.js";

export default function EntityListPage({
  title,
  subtitle,
  breadcrumbs,
  entity,
  columns,
  filterOptions = [],
  onAdd,
  addLabel = "Add New",
  onEdit,
  onView,
  statusOptions,
  exportFilename = "export",
  showExport = true,
  extraActions,
  extraToolbar,
}) {
  const {
    rows,
    loading,
    query,
    setQuery,
    filters,
    setFilters,
    sort,
    toggleSort,
    page,
    totalPages,
    setPage,
    pageSize,
    totalItems,
    selected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    bulkRemove,
    bulkUpdateStatus,
    remove,
    allFiltered,
  } = entity;

  const handleDelete = async (row) => {
    if (
      window.confirm(
        `Delete "${row.name || row.title || "this record"}"? This cannot be undone.`,
      )
    ) {
      await remove(row._id || row.id);
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            {extraActions}
            {onAdd && <Button onClick={onAdd}>+ {addLabel}</Button>}
          </>
        }
      />

      <Card padded={false}>
        <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3.5 border-b border-border-soft">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="max-w-[260px]"
            />
            {filterOptions.map((f) => (
              <Select
                key={f.key}
                value={filters[f.key] ?? "all"}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="max-w-[170px]"
              >
                <option value="all">{f.label}: All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ))}
            {extraToolbar}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-faint whitespace-nowrap">
              {totalItems} record{totalItems !== 1 ? "s" : ""}
            </span>
            {showExport && (
              <>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() =>
                    exportToCsv(exportFilename, columns, allFiltered)
                  }
                >
                  CSV
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() =>
                    exportToExcel(exportFilename, columns, allFiltered)
                  }
                >
                  Excel
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => printTable(title, columns, allFiltered)}
                >
                  Print
                </Button>
              </>
            )}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-gradient-soft border-b border-border-soft flex-wrap">
            <span className="text-[13px] font-semibold text-brand-magenta">
              {selected.length} selected
            </span>
            {statusOptions &&
              statusOptions.map((s) => (
                <Button
                  key={s.value}
                  size="sm"
                  variant="secondary"
                  onClick={() => bulkUpdateStatus(s.value)}
                >
                  Mark {s.label}
                </Button>
              ))}
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                window.confirm(`Delete ${selected.length} record(s)?`) &&
                bulkRemove()
              }
            >
              Delete Selected
            </Button>
            <button
              onClick={clearSelection}
              className="text-[12.5px] text-ink-faint hover:text-ink ml-auto"
            >
              Clear
            </button>
          </div>
        )}

        <div className="p-4">
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            selectable
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            sort={sort}
            onSort={toggleSort}
            onEdit={onEdit}
            onView={onView}
            onDelete={handleDelete}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>
    </div>
  );
}
