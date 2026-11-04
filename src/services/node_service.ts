import {apiFetch} from '../lib/api';

export interface OrgNode {
  id: string;
  name: string;
  depth?: number;
  children?: OrgNode[];
}

function flatten(nodes: OrgNode[], acc: OrgNode[] = []): OrgNode[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.children && n.children.length) {
      flatten(n.children, acc);
    }
  }
  return acc;
}

/** Org's full visible node tree, flattened to a simple {id, name} list
 *  (GET /platform/nodes — same source the web NodePicker uses). */
export async function fetchOrgNodes(): Promise<{id: string; name: string}[]> {
  const data = await apiFetch<{nodes?: OrgNode[]} | OrgNode[]>('/platform/nodes');
  const nodes = Array.isArray(data) ? data : (data?.nodes ?? []);
  return flatten(nodes)
    .filter(n => n.id && n.name)
    .map(n => ({id: n.id, name: n.name}));
}
