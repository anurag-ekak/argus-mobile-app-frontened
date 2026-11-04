import {apiFetch} from '../lib/api';

export interface OrgOverviewStats {
  total_branches: number;
  total_cameras: number;
  total_profiles: number;
  total_exe_tokens: number;
}

/** GET /dashboard/overview/stats — org-level aggregate counts. */
export async function fetchOrgOverviewStats(): Promise<OrgOverviewStats> {
  return apiFetch<OrgOverviewStats>('/dashboard/overview/stats');
}
