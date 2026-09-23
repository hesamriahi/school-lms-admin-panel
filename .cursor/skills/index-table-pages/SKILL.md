---
name: index-table-pages
description: Builds React admin index/list pages with the existing TableComp instead of custom tables. Use when creating or editing an index page, list page, صفحه ایندکس, لیست, جدول, TableComp, columns, filterItems, or actionButtons.
---

# Index pages with TableComp

This project already has a reusable table. For every index/list page, use `src/components/tables/TableComp.tsx`. Do not build a custom table, fetch-and-map rows, or reimplement pagination/filters.

## Hard rules

- Always render list data with `<TableComp />`.
- **Do not read** `TableComp.tsx` or `TableFilterComp.tsx`. Their public contract is in this skill. Re-reading them wastes tokens.
- Only open those files if the user reports a **new prop** that is not listed here.
- Take TableComp inputs from the current prompt (`columns`, `filterItems`, `actionButtons`, API paths, etc.). Do not invent a second table API.
- If required inputs are missing, ask. Do not guess API paths.
- Follow existing index pages such as `src/pages/Users/UserIndex.tsx` for layout, not `LoansIndex.tsx` (that file has extra modals).

## Page file convention

Path: `src/pages/<Domain>/<Name>Index.tsx`

Required shell:

1. `Permission.check([...])` — redirect to `ROUTES.home` if unauthorized. Ask which roles if not given.
2. `PageMeta` + `PageBreadcrumb`
3. Optional create button (`Button` + `PlusIcon`) only if the user asked
4. `<TableComp />` inside `<div className="space-y-6">` (or `space-y-3`)

Typical imports (adjust `../` depth to the page file):

```tsx
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import TableComp, { ActionButtonType, TableColumnType } from "../../components/tables/TableComp.tsx";
import { FilterItemType } from "../../components/tables/TableFilterComp.tsx";
import PageMeta from "../../components/common/PageMeta";
import { Permission } from "../../classes/Permission.ts";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../routes.ts";
```

## TableComp props

```ts
type TableCompProps = {
  apiRequestUrl?: string;                 // GET url, e.g. "api/admin/users"
  dataPathInApiRequest?: string;          // dotted path to row array, e.g. "data.users.data"
  columns: TableColumnType[];             // required
  outSideData?: any[];                    // local rows when there is no apiRequestUrl
  actionButtons?: ActionButtonType[];
  filterItems?: FilterItemType[];
  wantPagination: boolean;                // almost always true
  paginationPathInApiRequest?: string;    // parent of the row array, e.g. "data.users"
  statusesBarPathInApiRequest?: string;   // dotted path to status-bar items
  pageTitle?: string;                     // optional; currently unused by TableComp
  needExcelExport?: boolean;              // shows Excel button in the filter bar
  apiResponseReleaser?: (response: ApiResponse) => void;
  tableReloader?: (fn: () => void) => void;
};
```

Notes:

- TableComp itself calls `ApiRequest.call(apiRequestUrl, 'GET', null, filter, false, true)`.
- Nested fields use dotted names (`user.full_name`).
- Pagination object must have `from`, `to`, `total`, `current_page`, `last_page`.
- Convention: if rows are at `data.users.data`, pagination is `data.users`.
- Use `needExcelExport`, not `wantExcelExport`.
- `outSideData` is only for tables without `apiRequestUrl`.

## Columns (`TableColumnType`)

```ts
type tableCellTypes = 'enum' | 'datetime' | 'date' | 'number' | 'mobile' | 'text' | 'customComponent';
type enumColors = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' | 'noColor';

interface TableColumnType {
  name: string;                 // API field; dotted path allowed
  label: string;                // Persian header
  type?: tableCellTypes;        // default behaves as text
  enumValues?: { key: string | number | boolean; color: enumColors; label?: string | React.ReactNode }[];
  textLimit?: number;           // truncate text with "..."
  customComponent?: React.ComponentType<{ item: any }>;
  textNotCenter?: boolean;      // start-align text cells
  notNumberFormat?: boolean;    // Persian digits, no thousand separators (ids, national code, year)
  notSortable?: boolean;
  elementStyle?: string;        // unused in current TableComp; omit
}
```

Column type behavior:

| type | rendering |
|---|---|
| `text` (default) | raw value, optional `textLimit` |
| `number` | `toLocaleString('fa-IR')` unless `notNumberFormat` |
| `mobile` | Persian digits as `XXXX-XXXXXXX` |
| `date` | Jalali `YYYY/MM/DD` |
| `datetime` | Jalali datetime |
| `enum` | `Badge` from `enumValues` |
| `customComponent` | `<column.customComponent item={item} />` |

Use `notSortable: true` for nested/computed columns. Use `notNumberFormat: true` for ids, national codes, years, months.

## Action buttons (`ActionButtonType`)

```ts
interface ActionButtonType {
  name: string;
  label: string;                // tooltip
  icon: React.ReactNode;
  url?: string;                 // `:id` is replaced with `item.id`
  className?: string;
  onClick?: (item: any) => void;
}
```

- Prefer `url` for navigation. Example: `url: ROUTES.userEdit` where the route contains `:id`.
- Use `onClick` for modals, deletes, or custom navigation.
- If `onClick` is set, `url` is ignored.
- Default icon class: `"hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"`
- Common icons from `src/icons/index.ts`: `TableActionButtonEditIcon`, `TableActionButtonDeleteIcon`, `ListIcon`, `EyeIcon`, `DollarLineIcon`
- After mutate (delete/update), call `tableReloader.current?.()`

Reload callback pattern:

```tsx
const tableReloader = useRef<(() => void) | null>(null);

<TableComp
  tableReloader={(fn) => (tableReloader.current = fn)}
  // ...
/>
```

## Filters (`FilterItemType`)

```ts
interface FilterItemType {
  name: string;                 // query-string key sent to the API
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'datetimeRange' | 'selectBox' | 'multiSelectBox' | 'checkbox' | 'radio' | 'rangeNumber' | 'toggleSwitch' | 'customComponent';
  options?: { name?: string; label: string; value?: string | number | boolean; selected?: boolean }[];
  columnSize?: 1 | 2 | 3 | 4 | 5 | 6;   // xl grid span, default 1
  defaultValue?: string | number | boolean;
  customComponent?: React.ComponentType<{
    filter: Record<string, any>;
    setFilter: (name: string, value: any) => void;
    filterItem: FilterItemType;
  }>;
}
```

Filter value rules:

- `text` / `number` / `date` / `datetime` / `selectBox` / `rangeNumber`: `{ [name]: value }`
- `datetimeRange`: writes `start_${name}` and `end_${name}` (not `name`)
- `multiSelectBox`: array of selected values
- `checkbox`: array of option `name`s; `option.name` is required
- `radio`: selected option `value`; `selected: true` marks default
- `toggleSwitch`: `1` or `0`; `defaultValue: 1` starts on
- `customComponent`: must call `setFilter(name, value)` itself

Filters appear only when `filterItems` is non-empty. Excel export button appears only when `needExcelExport` is true **and** filters exist.

## Minimal page template

```tsx
export default function ExampleIndex() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;

  const columns: TableColumnType[] = [
    { name: "id", label: "شناسه", type: "number", notNumberFormat: true },
    { name: "title", label: "عنوان", type: "text", textLimit: 30 },
    { name: "created_at", label: "تاریخ ایجاد", type: "datetime" },
  ];

  const actionButtons: ActionButtonType[] = [
    {
      name: "edit",
      label: "ویرایش",
      icon: <TableActionButtonEditIcon />,
      url: ROUTES.exampleEdit,
      className: "hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
    },
  ];

  const filterItems: FilterItemType[] = [
    { name: "id", label: "شناسه", type: "number", columnSize: 1 },
    { name: "title", label: "عنوان", type: "text", columnSize: 1 },
  ];

  return (
    <>
      <PageMeta title="لیست نمونه" />
      <PageBreadcrumb pageTitle="لیست نمونه" />
      <div className="space-y-6">
        <TableComp
          apiRequestUrl="api/admin/examples"
          columns={columns}
          dataPathInApiRequest="data.examples.data"
          actionButtons={actionButtons}
          filterItems={filterItems}
          wantPagination={true}
          paginationPathInApiRequest="data.examples"
          needExcelExport={true}
        />
      </div>
    </>
  );
}
```

## Workflow

Copy and complete from the user prompt:

```
Inputs:
- [ ] file path / component name
- [ ] permission roles
- [ ] PageMeta / breadcrumb titles
- [ ] apiRequestUrl
- [ ] dataPathInApiRequest
- [ ] paginationPathInApiRequest
- [ ] columns
- [ ] filterItems (or none)
- [ ] actionButtons (or none)
- [ ] needExcelExport
- [ ] statusesBarPathInApiRequest (or none)
- [ ] create button / modal / extra UI
- [ ] register route + sidebar (only if asked)
```

Then:

1. Create or edit the `*Index.tsx` page using the template above.
2. Map user-provided columns/filters/actions onto the types in this skill.
3. If the user asked for a full new page, also add `ROUTES` in `src/routes.ts`, a `<Route>` in `src/App.tsx`, and a sidebar item in `src/layout/AppSidebar.tsx`.
4. Do not open `TableComp.tsx`.
5. Do not add unused props.

## Do not

- Do not use HTML `<table>` or other table components on index pages.
- Do not fetch the list in the page and pass it as `outSideData` when an API url exists.
- Do not re-read TableComp to "confirm" props.
- Do not copy LoansIndex modals unless the user asked for modal actions.
