import {useAuth} from '../context/AuthContext';

/**
 * The caller's node scope. Super Admin (root_visible) is org-wide (no nodeId);
 * Managerial / Waiter-Employee are node-scoped → their home node.
 */
export function useNodeScope(): {nodeId?: string} {
  const {scope} = useAuth();
  if (scope?.root_visible) {
    return {};
  }
  return {nodeId: scope?.home_node_id ?? undefined};
}
