// shared-dd-multiselecttree-data-operations.ts

import type { ProductCategoryNode } from './shared-dd-tree-data';

// نودی که علاوه بر اطلاعات دسته‌بندی، وضعیت‌های درخت هم دارد
export interface ProductCategoryStateNode extends ProductCategoryNode {
  items?: ProductCategoryStateNode[];
  expanded?: boolean;
  checked?: boolean;
}

// نوع state برای نودهای باز/بسته و تیک‌خورده
export type ExpandedState = { [id: string]: boolean };
export type CheckedState = { [id: string]: boolean };

// می‌تونی این رو به عنوان initial state استفاده کنی:
// const [expanded, setExpanded] = useState(expandedState);
export const expandedStateInitial: ExpandedState = {};

// Function to handle expand change events (for array-based expanded state)
export const expandedState = (
  item: any,
  dataItemKey: string,
  currentExpanded: string[]
): string[] => {
  const itemId = item[dataItemKey];
  return currentExpanded.includes(itemId)
    ? currentExpanded.filter(id => id !== itemId)
    : [...currentExpanded, itemId];
};

// اگر خواستی تیک‌ها رو هم کنترل کنی، می‌تونی یه state مثل این هم داشته باشی:
// const [checked, setChecked] = useState<CheckedState>({});
// ولی اینجا فقط type رو تعریف کردیم.

// تابع اصلی برای آماده‌سازی دیتا برای MultiSelectTree
export const processMultiSelectTreeData = (
  data: ProductCategoryNode[],
  expanded: ExpandedState = {},
  checked: CheckedState = {}
): ProductCategoryStateNode[] => {
  const addState = (nodes: ProductCategoryNode[]): ProductCategoryStateNode[] =>
    nodes.map((node) => {
      const nodeWithState: ProductCategoryStateNode = {
        ...node,
        expanded: expanded[node.id] ?? false,
        checked: checked[node.id] ?? false
      };

      if (node.items && node.items.length) {
        nodeWithState.items = addState(node.items);
      }

      return nodeWithState;
    });

  return addState(data);
};

// اگر دوست داشتی، این helper هم برای راحت‌تر toggle کردن نودها:
export const toggleExpanded = (
  current: ExpandedState,
  id: string
): ExpandedState => ({
  ...current,
  [id]: !current[id]
});
