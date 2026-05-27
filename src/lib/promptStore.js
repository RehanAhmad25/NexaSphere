/**
 * Prompt Store - Persistent storage for chat history using IndexedDB with localStorage fallback
 * Handles: save, load, search, delete, and workspace organization of prompts
 */

import logger from "./logger";

const DB_NAME = "NexaSphereDB";
const STORE_NAME = "prompts";
const DB_VERSION = 1;

let db = null;

/**
 * Initialize IndexedDB database
 */
export const initializeDB = async () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("workspace", "workspace", { unique: false });
        store.createIndex("pinned", "pinned", { unique: false });
      }
    };
  });
};

/**
 * Save a prompt-response pair to storage
 */
export const savePrompt = async (prompt, response, workspace = "default") => {
  try {
    const database = await initializeDB();

    const promptEntry = {
      userPrompt: prompt,
      botResponse: response,
      workspace,
      timestamp: Date.now(),
      pinned: false,
      queries: [prompt.toLowerCase()], // For search indexing
    };

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(promptEntry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    logger.error("Error saving prompt to IndexedDB:", error);
    // Fallback to localStorage
    savePromptToLocalStorage(prompt, response, workspace);
  }
};

/**
 * Get all prompts from storage
 */
export const getAllPrompts = async (workspace = null) => {
  try {
    const database = await initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      let request;
      if (workspace) {
        const index = store.index("workspace");
        request = index.getAll(workspace);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        resolve(results);
      };
    });
  } catch (error) {
    logger.error("Error retrieving prompts from IndexedDB:", error);
    return getPromptsFromLocalStorage(workspace);
  }
};

/**
 * Search prompts by keyword
 */
export const searchPrompts = async (keyword, workspace = null) => {
  try {
    const allPrompts = await getAllPrompts(workspace);
    const lowerKeyword = keyword.toLowerCase();

    return allPrompts.filter(
      (p) =>
        p.userPrompt.toLowerCase().includes(lowerKeyword) ||
        p.botResponse.toLowerCase().includes(lowerKeyword)
    );
  } catch (error) {
    logger.error("Error searching prompts:", error);
    return [];
  }
};

/**
 * Get pinned prompts
 */
export const getPinnedPrompts = async (workspace = null) => {
  try {
    const database = await initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("pinned");
      const request = index.getAll(true);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let results = request.result;
        if (workspace) {
          results = results.filter((p) => p.workspace === workspace);
        }
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
    });
  } catch (error) {
    logger.error("Error retrieving pinned prompts:", error);
    return [];
  }
};

/**
 * Pin/unpin a prompt
 */
export const togglePinPrompt = async (id, pinned) => {
  try {
    const database = await initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const prompt = getRequest.result;
        if (prompt) {
          prompt.pinned = !prompt.pinned;
          const updateRequest = store.put(prompt);

          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(prompt);
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    logger.error("Error toggling pin status:", error);
  }
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (id) => {
  try {
    const database = await initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (error) {
    logger.error("Error deleting prompt:", error);
  }
};

/**
 * Clear all prompts in a workspace
 */
export const clearWorkspace = async (workspace = "default") => {
  try {
    const database = await initializeDB();
    const allPrompts = await getAllPrompts(workspace);

    for (const prompt of allPrompts) {
      await deletePrompt(prompt.id);
    }
    return true;
  } catch (error) {
    logger.error("Error clearing workspace:", error);
  }
};

/**
 * Get recent prompts (last N)
 */
export const getRecentPrompts = async (limit = 10, workspace = null) => {
  try {
    const allPrompts = await getAllPrompts(workspace);
    return allPrompts.slice(0, limit);
  } catch (error) {
    logger.error("Error retrieving recent prompts:", error);
    return [];
  }
};

// ===== FALLBACK: LocalStorage Functions =====

const LOCALSTORAGE_KEY = "nexasphere_prompts";

const savePromptToLocalStorage = (prompt, response, workspace = "default") => {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "[]");
    stored.push({
      id: Date.now(),
      userPrompt: prompt,
      botResponse: response,
      workspace,
      timestamp: Date.now(),
      pinned: false,
    });
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    logger.error("Error saving to localStorage:", error);
  }
};

const getPromptsFromLocalStorage = (workspace = null) => {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "[]");
    if (workspace) {
      return stored.filter((p) => p.workspace === workspace);
    }
    return stored.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error("Error retrieving from localStorage:", error);
    return [];
  }
};

export const exportPrompts = async (workspace = null) => {
  const prompts = await getAllPrompts(workspace);
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexasphere-prompts-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const importPrompts = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const prompts = JSON.parse(e.target.result);
        for (const prompt of prompts) {
          await savePrompt(
            prompt.userPrompt,
            prompt.botResponse,
            prompt.workspace
          );
        }
        resolve(prompts.length);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
