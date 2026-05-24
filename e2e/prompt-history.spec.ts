import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Prompt History & Workspace System
 * Tests: Issue #100 - Prompt History & Workspace system
 */

test.describe('Prompt History & Workspace System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175'); // Adjust URL as needed
  });

  test('should open chatbot and display history UI', async ({ page }) => {
    // Click chat trigger button
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Wait for chat window to appear
    const chatWindow = page.locator('.chat-window-glass');
    await expect(chatWindow).toBeVisible();

    // Check for history toggle button
    const historyBtn = page.locator('.history-toggle-btn');
    await expect(historyBtn).toBeVisible();

    // Check for workspace selector
    const workspaceSelect = page.locator('.workspace-selector-inline');
    await expect(workspaceSelect).toBeVisible();
  });

  test('should save prompt and display in history', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Type and send message
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Hello, how are you?');
    
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Toggle sidebar to view history
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    // Check if sidebar opened
    const sidebar = page.locator('.history-sidebar.open');
    await expect(sidebar).toBeVisible();

    // Verify prompt appears in history
    const promptItem = page.locator('.prompt-item');
    await expect(promptItem).toHaveCount(1);
  });

  test('should search through prompt history', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send a message
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Test prompt');
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Use search bar
    const searchInput = page.locator('.search-input');
    await searchInput.fill('Test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Check if results appear
    const results = page.locator('.result-item');
    await expect(results).toHaveCount(1);
  });

  test('should switch between workspaces', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Get workspace selector
    const workspaceSelect = page.locator('.workspace-selector-inline');
    
    // Check current value
    const currentValue = await workspaceSelect.inputValue();
    expect(['default', 'coding', 'research']).toContain(currentValue);

    // Change workspace
    await workspaceSelect.selectOption('coding');

    // Verify change
    const newValue = await workspaceSelect.inputValue();
    expect(newValue).toBe('coding');
  });

  test('should pin and unpin prompts', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send a message
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Important message');
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Open sidebar
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    // Pin the prompt
    const pinBtn = page.locator('.pin-btn').first();
    await pinBtn.click();

    // Check if pinned indicator shows
    const pinnedItem = page.locator('.prompt-item.pinned');
    await expect(pinnedItem).toHaveCount(1);

    // Check if pinned chats section shows
    const pinnedChats = page.locator('.pinned-chats-container');
    await expect(pinnedChats).toBeVisible();
  });

  test('should restore conversation from history', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send initial message
    let input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('First conversation');
    let sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Get initial message count
    const initialMessages = page.locator('.msg-bubble');
    const initialCount = await initialMessages.count();

    // Open sidebar and select a prompt
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    const promptItem = page.locator('.prompt-item').first();
    await promptItem.click();

    // Wait for restoration
    await page.waitForTimeout(500);

    // Verify messages were restored
    const restoredMessages = page.locator('.msg-bubble');
    const restoredCount = await restoredMessages.count();
    expect(restoredCount).toBeGreaterThan(0);
  });

  test('should delete prompt from history', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send message
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Message to delete');
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Open sidebar
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    // Delete the prompt
    const deleteBtn = page.locator('.delete-btn').first();
    await deleteBtn.click();

    // Handle confirmation
    page.once('dialog', dialog => {
      dialog.accept();
    });

    await page.waitForTimeout(500);

    // Verify empty state or reduced items
    const promptItems = page.locator('.prompt-item');
    const count = await promptItems.count();
    expect(count).toBe(0);
  });

  test('should persist history on page refresh', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send message
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Persisted message');
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Refresh page
    await page.reload();

    // Open chat again
    const chatBtnAfter = page.locator('.chat-trigger-btn');
    await chatBtnAfter.click();

    // Open sidebar
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    // Verify history still exists
    const promptItem = page.locator('.prompt-item');
    await expect(promptItem).toHaveCount(1);
  });

  test('should filter history by workspace', async ({ page }) => {
    // Open chat
    const chatBtn = page.locator('.chat-trigger-btn');
    await chatBtn.click();

    // Send message in default workspace
    const input = page.locator('.chat-input-container input[type="text"]');
    await input.fill('Default workspace message');
    const sendBtn = page.locator('.send-btn');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Switch to coding workspace
    const workspaceSelect = page.locator('.workspace-selector-inline');
    await workspaceSelect.selectOption('coding');

    // Send message in coding workspace
    await input.fill('Coding workspace message');
    await sendBtn.click();

    await page.waitForTimeout(2000);

    // Open sidebar and check workspace selector
    const historyBtn = page.locator('.history-toggle-btn');
    await historyBtn.click();

    // Verify current workspace in sidebar
    const sidebarWorkspaceSelect = page.locator('.workspace-select');
    const value = await sidebarWorkspaceSelect.inputValue();
    expect(value).toBe('coding');
  });
});
