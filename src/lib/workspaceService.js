/**
 * Workspace Service - Manage workspaces/projects for organizing prompts
 * Handles: create, rename, delete, list workspaces
 */

const WORKSPACES_KEY = 'nexasphere_workspaces';

const DEFAULT_WORKSPACES = [
  {
    id: 'default',
    name: 'General',
    color: '#6366f1',
    createdAt: Date.now(),
    itemCount: 0,
  },
  {
    id: 'coding',
    name: 'Coding & Debug',
    color: '#ec4899',
    createdAt: Date.now(),
    itemCount: 0,
  },
  {
    id: 'research',
    name: 'Research',
    color: '#f59e0b',
    createdAt: Date.now(),
    itemCount: 0,
  },
];

/**
 * Initialize workspaces in localStorage if not present
 */
export const initializeWorkspaces = () => {
  const stored = localStorage.getItem(WORKSPACES_KEY);
  if (!stored) {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(DEFAULT_WORKSPACES));
    return DEFAULT_WORKSPACES;
  }
  return JSON.parse(stored);
};

/**
 * Get all workspaces
 */
export const getWorkspaces = () => {
  try {
    const stored = localStorage.getItem(WORKSPACES_KEY);
    return stored ? JSON.parse(stored) : initializeWorkspaces();
  } catch (error) {
    console.error('Error retrieving workspaces:', error);
    return initializeWorkspaces();
  }
};

/**
 * Create a new workspace
 */
export const createWorkspace = (name, color = '#6366f1') => {
  try {
    const workspaces = getWorkspaces();
    const id = `workspace_${Date.now()}`;
    
    const newWorkspace = {
      id,
      name,
      color,
      createdAt: Date.now(),
      itemCount: 0,
    };

    workspaces.push(newWorkspace);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    return newWorkspace;
  } catch (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
};

/**
 * Update workspace
 */
export const updateWorkspace = (id, updates) => {
  try {
    const workspaces = getWorkspaces();
    const workspace = workspaces.find((w) => w.id === id);

    if (workspace) {
      Object.assign(workspace, updates);
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
      return workspace;
    }
    return null;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
};

/**
 * Delete workspace (but keep 'default')
 */
export const deleteWorkspace = (id) => {
  if (id === 'default') {
    console.warn('Cannot delete default workspace');
    return false;
  }

  try {
    const workspaces = getWorkspaces().filter((w) => w.id !== id);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
};

/**
 * Rename workspace
 */
export const renameWorkspace = (id, newName) => {
  return updateWorkspace(id, { name: newName });
};

/**
 * Update item count for workspace (for statistics)
 */
export const updateWorkspaceItemCount = async (workspaceId, count) => {
  return updateWorkspace(workspaceId, { itemCount: count });
};

/**
 * Get workspace by ID
 */
export const getWorkspaceById = (id) => {
  const workspaces = getWorkspaces();
  return workspaces.find((w) => w.id === id);
};
