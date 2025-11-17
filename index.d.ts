export type Resources = {
  [key: string]: any
}

export type NamespaceForToc = {
  name: string;
  path: string;
  resources?: Resources;
}
export type NamespacesForToc = NamespaceForToc[]

export type NamespaceForMerge = {
  name: string;
  path?: string;
  resources: Resources;
}
export type NamespacesForMerge = NamespaceForMerge[]
export type Merged = {
  [ns: string]: Resources;
}

export function tocForResources (namespaces: NamespacesForToc, toPath: string, options?: { quotes?: 'single' | 'double' }): string
export function mergeResources (namespaces: NamespacesForMerge): Merged
export function mergeResourcesAsInterface (namespaces: NamespacesForMerge, options?: { optimize?: boolean; indentation?: number | string }): string
export function json2ts (resources: Resources): string
