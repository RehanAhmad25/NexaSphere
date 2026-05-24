/**
 * Prompt Store Tests
 * Testing IndexedDB storage functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeDB,
  savePrompt,
  getAllPrompts,
  searchPrompts,
  getPinnedPrompts,
  togglePinPrompt,
  deletePrompt,
  clearWorkspace,
  getRecentPrompts,
} from '../lib/promptStore';

// Mock IndexedDB for testing
const mockDb = {
  prompts: [],
};

describe('Prompt Store', () => {
  beforeEach(() => {
    mockDb.prompts = [];
  });

  it('should save a prompt', async () => {
    const result = await savePrompt('Hello', 'Hi there', 'default');
    expect(result).toBeDefined();
  });

  it('should retrieve all prompts', async () => {
    await savePrompt('Question 1', 'Answer 1', 'default');
    await savePrompt('Question 2', 'Answer 2', 'default');
    const prompts = await getAllPrompts('default');
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('should search prompts by keyword', async () => {
    await savePrompt('How to use React', 'React is a library', 'coding');
    const results = await searchPrompts('React', 'coding');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should get recent prompts', async () => {
    await savePrompt('Q1', 'A1', 'default');
    await savePrompt('Q2', 'A2', 'default');
    await savePrompt('Q3', 'A3', 'default');
    const recent = await getRecentPrompts(2, 'default');
    expect(recent.length).toBeLessThanOrEqual(2);
  });

  it('should toggle pin status', async () => {
    const id = await savePrompt('Important', 'Very important answer', 'default');
    const toggled = await togglePinPrompt(id, true);
    expect(toggled.pinned).toBe(true);
  });

  it('should get pinned prompts', async () => {
    const id1 = await savePrompt('Q1', 'A1', 'default');
    const id2 = await savePrompt('Q2', 'A2', 'default');
    
    await togglePinPrompt(id1, true);
    
    const pinned = await getPinnedPrompts('default');
    expect(pinned.length).toBeGreaterThan(0);
  });

  it('should delete a prompt', async () => {
    const id = await savePrompt('To delete', 'Delete me', 'default');
    const result = await deletePrompt(id);
    expect(result).toBe(true);
  });

  it('should clear workspace', async () => {
    await savePrompt('Q1', 'A1', 'test-workspace');
    await savePrompt('Q2', 'A2', 'test-workspace');
    const result = await clearWorkspace('test-workspace');
    expect(result).toBe(true);
  });

  it('should filter prompts by workspace', async () => {
    await savePrompt('Coding Q', 'Coding A', 'coding');
    await savePrompt('Research Q', 'Research A', 'research');
    
    const codingPrompts = await getAllPrompts('coding');
    const researchPrompts = await getAllPrompts('research');
    
    expect(codingPrompts.length).toBeGreaterThan(0);
    expect(researchPrompts.length).toBeGreaterThan(0);
  });
});
