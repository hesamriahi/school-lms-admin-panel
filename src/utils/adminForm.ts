import ApiRequest, { ApiResponse } from "../classes/ApiRequest";

export type MediaDisplay = {
  id?: number;
  url?: string;
  conversions?: { sm?: string; md?: string; lg?: string };
};

export function mediaUrl(media?: MediaDisplay | null) {
  return media?.conversions?.sm || media?.url || "";
}

export const selectClassName =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export function rowsFrom(response: any, key: string): any[] {
  const block = response?.data?.[key];
  if (Array.isArray(block)) return block;
  if (Array.isArray(block?.data)) return block.data;
  return [];
}

export async function submitAdminResource(
  url: string,
  isUpdate: boolean,
  payload: Record<string, any>,
  hasFiles = false
): Promise<ApiResponse> {
  if (isUpdate && hasFiles) payload._method = "PUT";
  return ApiRequest.call(
    url,
    isUpdate && !hasFiles ? "PUT" : "POST",
    payload,
    null,
    true,
    true,
    hasFiles
  );
}
