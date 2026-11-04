import type {UsecaseModuleDescriptor} from '../_types';

/**
 * Loyalty Program — usecase module. Mirror of the web app's
 * src/usecases/loyalty-program/usecase.ts.
 */
const loyaltyProgram: UsecaseModuleDescriptor = {
  slug: 'loyalty-program',
  displayName: 'Loyalty Program',
  categoryId: 'customer-engagement',
  description: 'Turn repeat walk-ins into loyalty members with tiers.',
  nav: {
    section: 'Use Cases',
    icon: 'award',
    children: [
      {label: 'Loyalty List', page: 'loyalty', icon: 'users'},
      {label: 'Visitors List', page: 'visitors', icon: 'footprints'},
      {label: "Today's Arrival", page: 'arrivals', icon: 'calendar-clock'},
    ],
  },
  flags: {hasActivation: true, hasDashboard: true, hasSettings: true},
  dashboardScopes: ['org'],
  activationScopes: ['org'],
  settings: {label: 'Loyalty Settings', permission: 'loyalty.edit'},
  dashboardEndpoints: {
    kpi: {org: '/loyalty/kpis', node: '/loyalty/kpis?node_id={nodeId}'},
    charts: {},
  },
  profileEndpoints: {detail: '', chart: '', scoped: ''},
};

export default loyaltyProgram;
