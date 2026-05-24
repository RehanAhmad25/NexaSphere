# Prompt History & Workspace System - Implementation Guide

## Overview

This implementation adds a **Prompt History & Workspace system** to NexaSphere's AI chat interface, allowing users to:

- **Persist chat history** across browser refreshes using IndexedDB
- **Search** through previous prompts and responses
- **Organize** conversations into workspaces/projects
- **Pin** important conversations for quick access
- **Auto-save** all AI interactions

## Architecture

### Storage Layer (`src/lib/promptStore.js`)

**Purpose:** Manages persistent storage of prompts using IndexedDB with localStorage fallback.

**Key Functions:**
- `initializeDB()` - Initialize IndexedDB database
- `savePrompt(prompt, response, workspace)` - Save prompt-response pair
- `getAllPrompts(workspace)` - Retrieve all prompts, optionally filtered by workspace
- `searchPrompts(keyword, workspace)` - Full-text search across prompts
- `getPinnedPrompts(workspace)` - Get pinned conversations
- `togglePinPrompt(id, pinned)` - Pin/unpin a conversation
- `deletePrompt(id)` - Delete a conversation
- `getRecentPrompts(limit, workspace)` - Get N most recent prompts
- `exportPrompts(workspace)` - Export as JSON
- `importPrompts(file)` - Import from JSON file

**Storage Schema:**
```javascript
{
  id: number,                    // Auto-incremented
  userPrompt: string,            // User's message
  botResponse: string,           // AI's response
  workspace: string,             // Workspace ID
  timestamp: number,             // Milliseconds since epoch
  pinned: boolean,               // Pinned status
  queries: [string]              // For search indexing
}
```

### Workspace Service (`src/lib/workspaceService.js`)

**Purpose:** Manage workspaces/projects for organizing prompts.

**Key Functions:**
- `initializeWorkspaces()` - Create default workspaces
- `getWorkspaces()` - List all workspaces
- `createWorkspace(name, color)` - Create new workspace
- `renameWorkspace(id, newName)` - Rename workspace
- `deleteWorkspace(id)` - Delete workspace (not 'default')
- `getWorkspaceById(id)` - Get workspace details
- `updateWorkspaceItemCount(id, count)` - Update statistics

**Default Workspaces:**
1. `default` - General conversations
2. `coding` - Coding & debugging
3. `research` - Research topics

### UI Components

#### 1. **PromptHistorySidebar** (`src/components/history/PromptHistorySidebar.jsx`)

Collapsible sidebar showing:
- Workspace selector dropdown
- List of prompts in selected workspace
- Pin/delete actions for each prompt
- Time-formatted timestamps

**Props:**
- `isOpen: boolean` - Show/hide sidebar
- `onSelectPrompt: (prompt) => void` - Callback when prompt selected
- `currentWorkspace: string` - Active workspace

#### 2. **SearchBar** (`src/components/history/SearchBar.jsx`)

Inline search component featuring:
- Real-time keyword search
- Results dropdown showing matching prompts
- Clear button
- Loading spinner

**Props:**
- `onSelectPrompt: (prompt) => void` - Callback on selection
- `workspace: string` - Search within workspace

#### 3. **PinnedChats** (`src/components/history/PinnedChats.jsx`)

Displays pinned conversations in a compact format with:
- Pin count badge
- Quick unpin action
- Click to restore conversation

**Props:**
- `onSelectPrompt: (prompt) => void` - Callback on selection
- `workspace: string` - Filter by workspace

### Updated Chatbot Component (`src/shared/Chatbot.jsx`)

**New Features:**
1. **Sidebar Toggle** - History button (📋) in header
2. **Workspace Selector** - Dropdown in input area
3. **Auto-Save** - Captures prompt-response on each exchange
4. **Prompt Selection** - Restore selected conversations
5. **Integrated Search & Pinned UI**

**State Management:**
```javascript
const [showSidebar, setShowSidebar] = useState(false);
const [currentWorkspace, setCurrentWorkspace] = useState('default');
```

**Auto-Save Hook:**
```javascript
useEffect(() => {
  // Triggers on new messages
  if (messages.length >= 2) {
    savePrompt(lastUserMsg.text, lastBotMsg.text, currentWorkspace)
  }
}, [messages, currentWorkspace]);
```

## Styling

### CSS Files

1. **PromptHistorySidebar.css** - Sidebar styling with animations
2. **SearchBar.css** - Search input and results dropdown
3. **PinnedChats.css** - Pinned conversations display
4. **chatbot.css** - Updated with:
   - Sidebar layout support
   - Responsive design
   - Mobile optimizations

**Key Design Elements:**
- Glass-morphism aesthetic matching NexaSphere theme
- Dark theme (indigo/red color scheme)
- Smooth animations and transitions
- Mobile-first responsive design
- Accessibility: Focus states, hover effects

## Testing

### Test Files

1. **`src/lib/__tests__/promptStore.test.js`**
   - Tests: Save, retrieve, search, pin, delete operations
   - Coverage: All storage layer functions

2. **`src/lib/__tests__/workspaceService.test.js`**
   - Tests: Create, update, delete, rename workspaces
   - Coverage: Workspace management

### Running Tests

```bash
npm run test
```

### Test Coverage Goals

- ✅ Storage persistence
- ✅ Search functionality
- ✅ Workspace isolation
- ✅ Pin/unpin operations
- ✅ Auto-save on new messages
- ✅ Responsive UI rendering

## Usage Guide

### For Users

1. **Auto-Save**: All prompts are automatically saved to your device
2. **Switch Workspace**: Use dropdown in chat input area to organize by topic
3. **Search History**: Click search bar to find previous conversations
4. **Pin Important**: Click 📌 icon to quickly access critical discussions
5. **View Sidebar**: Click 📋 button to toggle full history view

### For Developers

#### Initialize Prompt Storage

```javascript
import { initializeDB, savePrompt } from '../lib/promptStore';

// Initialize database
await initializeDB();

// Save a prompt
await savePrompt('User question', 'AI response', 'workspace-id');
```

#### Create New Workspace

```javascript
import { createWorkspace } from '../lib/workspaceService';

const workspace = createWorkspace('My Project', '#6366f1');
```

#### Retrieve Prompts

```javascript
import { getAllPrompts, searchPrompts } from '../lib/promptStore';

// Get all in workspace
const prompts = await getAllPrompts('workspace-id');

// Search
const results = await searchPrompts('keyword', 'workspace-id');
```

## Browser Compatibility

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **Fallback**: localStorage for unsupported browsers
- **No Third-party Libraries**: Uses native browser APIs only

## Performance Considerations

1. **Lazy Loading**: Sidebar loads prompts on demand
2. **Search Debouncing**: Search results update responsively
3. **Efficient Indexing**: IndexedDB indexes on timestamp and workspace
4. **LocalStorage Limits**: ~5-10MB per domain (sufficient for ~100k prompts)
5. **IndexedDB Limits**: Typically 50MB+ per domain

## Security Notes

- ✅ Local storage only (no external API calls for history)
- ✅ No sensitive data transmitted
- ✅ User isolation via workspace organization
- ✅ Auto-delete options for sensitive conversations

## Future Enhancements

1. **Cloud Sync**: Backend storage for authenticated users
2. **Collaboration**: Share workspace prompts with team members
3. **Analytics**: Track most-searched topics, favorite responses
4. **Smart Organization**: Auto-tagging based on content
5. **Version Control**: Compare prompt iterations
6. **Export/Import**: Full history backup and restoration
7. **Offline Support**: Service Worker caching

## File Structure

```
src/
├── lib/
│   ├── promptStore.js                 # Storage layer (IndexedDB)
│   ├── workspaceService.js            # Workspace management
│   └── __tests__/
│       ├── promptStore.test.js
│       └── workspaceService.test.js
├── components/
│   └── history/
│       ├── PromptHistorySidebar.jsx   # Sidebar component
│       ├── PromptHistorySidebar.css
│       ├── SearchBar.jsx               # Search component
│       ├── SearchBar.css
│       ├── PinnedChats.jsx             # Pinned conversations
│       └── PinnedChats.css
├── shared/
│   └── Chatbot.jsx                    # Updated with auto-save
└── styles/
    └── chatbot.css                    # Updated styling
```

## Related Issues

- **Issue #100**: Prompt History & Workspace system
- **Labels**: `enhancement`, `frontend`, `ai-workflow`, `ux`

## Contribution Guidelines

When modifying this feature:
1. Follow coding standards from CONTRIBUTING.md
2. Update tests for new functionality
3. Maintain IndexedDB schema compatibility
4. Test on multiple browsers
5. Verify mobile responsiveness
6. Update this documentation

## Debugging

### Check if IndexedDB is Available

```javascript
console.log('IndexedDB available:', !!window.indexedDB);
```

### View Stored Data (DevTools)

1. Open DevTools → Application → IndexedDB
2. Expand "NexaSphereDB" → "prompts" store
3. View all saved prompt entries

### Clear Storage

```javascript
// Clear all prompts
localStorage.removeItem('nexasphere_prompts');
indexedDB.deleteDatabase('NexaSphereDB');
```

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review component props documentation
3. Open an issue on GitHub with reproduction steps
