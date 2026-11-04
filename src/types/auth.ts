export type User = {
  id: string;
  name?: string;
  username: string;
  email: string;
  role: 'admin' | 'branch_admin';
  branch_id?: string | null;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  onboarding_status:
    | 'PENDING'
    | 'USECASES_SELECTED'
    | 'CAMERA_REGISTERED'
    | 'COMPLETED';
};

export type Scope = {
  home_node_id: string | null;
  root_visible: boolean;
};

export type MeResponse = {
  user: User;
  organization: Organization;
  permissions: string[];
  scope: Scope | null;
};

/** Mobile's three derived roles (Super Admin / Managerial / Waiter-Employee). */
export type AppRole = 'super_admin' | 'managerial' | 'waiter';

export type LoginPayload = {
  organization_slug: string;
  email: string;
  password: string;
};
