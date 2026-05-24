/**
 * Workspace Service Tests
 * Testing workspace management functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeWorkspaces,
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  renameWorkspace,
  getWorkspaceById,
} from '../workspaceService';

describe('Workspace Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize default workspaces', () => {
    const workspaces = initializeWorkspaces();
    expect(workspaces.length).toBeGreaterThan(0);
    expect(workspaces.some((w) => w.id === 'default')).toBe(true);
  });

  it('should get all workspaces', () => {
    initializeWorkspaces();
    const workspaces = getWorkspaces();
    expect(Array.isArray(workspaces)).toBe(true);
    expect(workspaces.length).toBeGreaterThan(0);
  });

  it('should create a new workspace', () => {
    initializeWorkspaces();
    const newWs = createWorkspace('Custom Workspace', '#ff0000');
    expect(newWs).toBeDefined();
    expect(newWs.name).toBe('Custom Workspace');
    expect(newWs.color).toBe('#ff0000');
  });

  it('should get workspace by ID', () => {
    initializeWorkspaces();
    const ws = getWorkspaceById('default');
    expect(ws).toBeDefined();
    expect(ws.id).toBe('default');
  });

  it('should rename a workspace', () => {
    initializeWorkspaces();
    const renamed = renameWorkspace('default', 'General Queries');
    expect(renamed.name).toBe('General Queries');
  });

  it('should update workspace properties', () => {
    initializeWorkspaces();
    const updated = updateWorkspace('default', { color: '#0000ff' });
    expect(updated.color).toBe('#0000ff');
  });

  it('should delete a non-default workspace', () => {
    initializeWorkspaces();
    const newWs = createWorkspace('Temp Workspace');
    const result = deleteWorkspace(newWs.id);
    expect(result).toBe(true);

    const workspaces = getWorkspaces();
    expect(workspaces.find((w) => w.id === newWs.id)).toBeUndefined();
  });

  it('should not delete default workspace', () => {
    initializeWorkspaces();
    const result = deleteWorkspace('default');
    expect(result).toBe(false);

    const ws = getWorkspaceById('default');
    expect(ws).toBeDefined();
  });

  it('should persist workspaces in localStorage', () => {
    initializeWorkspaces();
    const ws1 = createWorkspace('Workspace 1');
    
    // Simulate page refresh
    const stored = JSON.parse(localStorage.getItem('nexasphere_workspaces'));
    expect(stored.find((w) => w.id === ws1.id)).toBeDefined();
  });
});
