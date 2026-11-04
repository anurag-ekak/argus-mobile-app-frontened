// src/usecases/_types.ts — the contract every usecase module ships.
// Mirrors the web app's src/usecases/_types.ts (descriptor only; the component
// map lives on the generated manifest entry).

export type UsecaseModuleScope = 'org' | 'node';

export type UsecaseNavChild = {
  label: string;
  /** Route segment under the parent page AND the `childPages[page]` key. */
  page: string;
  icon?: string;
};

export type UsecaseSettingsMeta = {
  label: string;
  permission: string;
};

export type UsecaseSettingsProps = {
  useCaseId: string;
};

export type UsecaseModuleDescriptor = {
  slug: string;
  displayName: string;
  categoryId: string;
  description: string;
  nav: {section: string; icon: string; children?: UsecaseNavChild[]};
  flags: {hasActivation: boolean; hasDashboard: boolean; hasSettings: boolean};
  dashboardScopes: UsecaseModuleScope[];
  activationScopes: UsecaseModuleScope[];
  /** Present only when `flags.hasSettings` is true. */
  settings?: UsecaseSettingsMeta;
  dashboardEndpoints: {
    kpi: Record<UsecaseModuleScope, string>;
    charts: Record<string, Record<UsecaseModuleScope, string>>;
  };
  profileEndpoints: {
    detail: string;
    chart: string;
    scoped: string;
  };
};
