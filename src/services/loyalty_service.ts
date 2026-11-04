import {apiFetch} from '../lib/api';

// ─── Shapes (mirror web src/usecases/loyalty-program/dashboard/services) ─────

export interface LoyaltyKPIs {
  total_members: number;
  eligible_count: number;
  newly_onboarded: number;
  visit_frequency: number;
  avg_visits_per_member_month: number;
}

export interface LoyaltyMember {
  id: string;
  profile_id: string;
  node_id: string;
  node_name?: string | null;
  person_name: string;
  email: string | null;
  phone: string | null;
  loyalty_phone: string | null;
  preferences: Record<string, string | null>;
  visit_count: number;
  last_visit_at: string | null;
  onboarded_at: string | null;
  onboarded_by?: string | null;
  onboarded_by_name?: string | null;
  status: string;
  tier: 'gold' | 'silver' | 'bronze';
  image_url?: string | null;
}

export interface LoyaltyCandidate {
  visitor_id: string;
  node_id: string;
  node_name?: string | null;
  visit_count: number;
  last_seen_at: string | null;
  img_url: string | null;
  person_name: string;
  image_url?: string | null;
  photo_url?: string | null;
  status?: string;
}

export interface LoyaltyArrival {
  member_id: string;
  profile_id: string;
  person_name: string;
  email: string | null;
  node_id: string;
  node_name: string | null;
  tier: 'gold' | 'silver' | 'bronze';
  visit_count: number;
  first_seen_at: string | null;
  last_seen_at: string | null;
  member_photo_url?: string | null;
  annotation_photo_url?: string | null;
}

export interface LoyaltyNotification {
  id: string;
  title: string;
  body: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MemberVisit {
  id: string;
  node_id: string;
  node_name: string | null;
  camera_id: string | null;
  area_id: string | null;
  entry_at: string;
  visit_date: string;
  photo_url?: string | null;
}

export interface MemberStats {
  total_visits: number;
  unique_nodes: number;
  first_seen: string | null;
}

export interface OnboardPayload {
  visitor_id: string;
  node_id: string;
  name?: string;
  email?: string;
  phone?: string;
  dish?: string;
  allergies?: string;
  fav_table?: string;
  preferred_name?: string;
  notes?: string;
  usual_visit_time?: string;
}

// ─── Overview v3 (GET /loyalty/overview/*) ──────────────────────────────────

export interface LoyaltySeries {
  labels: string[];
  data: number[];
}

export interface OverviewSummary {
  total_members: number;
  eligible_count: number;
  visit_frequency: number;
}

export interface OverviewNode {
  node_id: string;
  node_name: string | null;
  loyal: number;
  eligible: number;
  conversion_pct: number;
}

export interface OverviewLeaderboard {
  best_node: {node_name: string | null; arrivals: number};
  fastest_node: {node_name: string | null; onboarded: number};
}

// ─── Visitors (GET /loyalty/visits/*) ───────────────────────────────────────

export interface WalkinKPIs {
  new_today: number;
  peak_time: string;
  share: number;
  tpb: string;
  fgb: string;
}

export interface RepeatKPIs {
  rv_today: number;
  peak_hour: string;
  share: number;
}

export interface Footfall {
  labels: string[];
  data: number[];
}

export interface VisitLogRow {
  uid: string;
  visit_date: string;
  visit_time: string;
  node_name?: string;
  visit_count?: number;
}

export interface VisitLog {
  logs: VisitLogRow[];
  total: number;
}

export interface Heatmap {
  days: string[];
  hours: string[];
  data: number[][];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object') {
    for (const v of Object.values(data as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        return v as T[];
      }
    }
  }
  return [];
}

// ─── fetchers ────────────────────────────────────────────────────────────────

export async function fetchLoyaltyKPIs(nodeId?: string): Promise<LoyaltyKPIs> {
  return apiFetch<LoyaltyKPIs>(`/loyalty/kpis${qs({node_id: nodeId})}`);
}

export async function fetchMembers(
  opts: {
    nodeId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {},
): Promise<{members: LoyaltyMember[]; total: number}> {
  const data = await apiFetch<{members: LoyaltyMember[]; total: number}>(
    `/loyalty/members${qs({
      node_id: opts.nodeId,
      page: opts.page ?? 1,
      page_size: opts.pageSize ?? 25,
      sort_by: opts.sortBy,
      sort_order: opts.sortOrder,
    })}`,
  );
  return {members: data.members ?? [], total: data.total ?? 0};
}

export async function searchMembers(query: string): Promise<LoyaltyMember[]> {
  const data = await apiFetch<{members: LoyaltyMember[]}>(
    `/loyalty/members/search${qs({q: query})}`,
  );
  return data.members ?? [];
}

export async function fetchMemberDetail(memberId: string): Promise<LoyaltyMember> {
  return apiFetch<LoyaltyMember>(`/loyalty/members/${memberId}`);
}

export async function fetchMemberVisits(memberId: string): Promise<MemberVisit[]> {
  const data = await apiFetch<{visits: MemberVisit[]}>(
    `/loyalty/members/${memberId}/visits`,
  );
  return data.visits ?? [];
}

export async function fetchMemberStats(memberId: string): Promise<MemberStats> {
  return apiFetch<MemberStats>(`/loyalty/members/${memberId}/stats`);
}

export async function fetchCandidates(
  nodeId?: string,
): Promise<LoyaltyCandidate[]> {
  const data = await apiFetch<{candidates: LoyaltyCandidate[]}>(
    `/loyalty/candidates${qs({node_id: nodeId})}`,
  );
  return data.candidates ?? [];
}

export async function fetchArrivals(
  date?: string,
  nodeId?: string,
): Promise<LoyaltyArrival[]> {
  const data = await apiFetch<{arrivals: LoyaltyArrival[]}>(
    `/loyalty/arrivals${qs({date, node_id: nodeId})}`,
  );
  return data.arrivals ?? [];
}

export async function fetchLoyaltyNotifications(
  limit = 20,
): Promise<LoyaltyNotification[]> {
  const data = await apiFetch<{notifications: LoyaltyNotification[]}>(
    `/loyalty/notifications${qs({limit})}`,
  );
  return data.notifications ?? [];
}

export async function onboardMember(
  payload: OnboardPayload,
): Promise<LoyaltyMember> {
  return apiFetch<LoyaltyMember>('/loyalty/onboard', {
    method: 'POST',
    body: payload,
  });
}

// ─── Overview v3 fetchers ───────────────────────────────────────────────────

export async function fetchOverviewSummary(
  asOf?: string,
): Promise<OverviewSummary> {
  return apiFetch<OverviewSummary>(
    `/loyalty/overview/summary${qs({as_of: asOf})}`,
  );
}

export async function fetchOverviewOnboarded(
  from: string,
  to: string,
): Promise<{count: number}> {
  return apiFetch<{count: number}>(
    `/loyalty/overview/onboarded${qs({from, to})}`,
  );
}

export async function fetchOverviewArrivalsTrend(
  from: string,
  to: string,
): Promise<LoyaltySeries> {
  return apiFetch<LoyaltySeries>(
    `/loyalty/overview/arrivals-trend${qs({from, to})}`,
  );
}

export async function fetchOverviewNodes(
  asOf?: string,
): Promise<OverviewNode[]> {
  const data = await apiFetch<unknown>(
    `/loyalty/overview/nodes${qs({as_of: asOf})}`,
  );
  return asArray<OverviewNode>(data);
}

export async function fetchOverviewLeaderboard(
  from: string,
  to: string,
): Promise<OverviewLeaderboard> {
  return apiFetch<OverviewLeaderboard>(
    `/loyalty/overview/leaderboard${qs({from, to})}`,
  );
}

export async function fetchMemberGrowth(
  nodeId?: string,
  days = 30,
): Promise<LoyaltySeries> {
  return apiFetch<LoyaltySeries>(
    `/loyalty/members/growth${qs({node_id: nodeId, days})}`,
  );
}

export async function fetchMemberFrequency(
  nodeId?: string,
): Promise<LoyaltySeries> {
  return apiFetch<LoyaltySeries>(
    `/loyalty/members/frequency${qs({node_id: nodeId})}`,
  );
}

// ─── Visitors fetchers ──────────────────────────────────────────────────────

export async function fetchWalkinKpis(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<WalkinKPIs> {
  return apiFetch<WalkinKPIs>(
    `/loyalty/visits/kpis${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
}

export async function fetchWalkinFootfall(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<Footfall> {
  return apiFetch<Footfall>(
    `/loyalty/visits/footfall${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
}

export async function fetchRepeatKpis(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<RepeatKPIs> {
  return apiFetch<RepeatKPIs>(
    `/loyalty/visits/repeat/kpis${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
}

export async function fetchRepeatFootfall(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<Footfall> {
  return apiFetch<Footfall>(
    `/loyalty/visits/repeat/footfall${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
}

export async function fetchRepeatHeatmap(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<Heatmap> {
  return apiFetch<Heatmap>(
    `/loyalty/visits/repeat/heatmap${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
}

export async function fetchWalkinLog(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<VisitLog> {
  const data = await apiFetch<unknown>(
    `/loyalty/visits/log${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
  return {
    logs: asArray<VisitLogRow>(
      (data as {logs?: VisitLogRow[]})?.logs ?? data,
    ),
    total: (data as {total?: number})?.total ?? 0,
  };
}

export async function fetchRepeatLog(
  nodeId?: string,
  fromDate?: string,
  toDate?: string,
): Promise<VisitLog> {
  const data = await apiFetch<unknown>(
    `/loyalty/visits/repeat/log${qs({node_id: nodeId, from_date: fromDate, to_date: toDate})}`,
  );
  return {
    logs: asArray<VisitLogRow>(
      (data as {logs?: VisitLogRow[]})?.logs ?? data,
    ),
    total: (data as {total?: number})?.total ?? 0,
  };
}
