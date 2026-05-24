import React, { useState, useEffect } from 'react';
import { getAllPrompts, deletePrompt, togglePinPrompt } from '../../lib/promptStore';
import { getWorkspaces } from '../../lib/workspaceService';
import './PromptHistorySidebar.css';

const PromptHistorySidebar = ({ isOpen, onSelectPrompt, currentWorkspace = 'default' }) => {
  const [prompts, setPrompts] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedWorkspace]);

  const loadData = async () => {
    setLoading(true);
    try {
      const workspaceList = getWorkspaces();
      setWorkspaces(workspaceList);
      
      const promptList = await getAllPrompts(selectedWorkspace);
      setPrompts(promptList);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deletePrompt(id);
      loadData();
    }
  };

  const handlePinPrompt = async (e, id) => {
    e.stopPropagation();
    await togglePinPrompt(id);
    loadData();
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCurrentWorkspaceName = () => {
    return workspaces.find((w) => w.id === selectedWorkspace)?.name || 'General';
  };

  return (
    <div className={`history-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>History</h3>
        <span className="workspace-badge">{getCurrentWorkspaceName()}</span>
      </div>

      <div className="workspace-selector">
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="workspace-select"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      <div className="prompts-list">
        {loading ? (
          <div className="loading-state">
            <span>Loading...</span>
          </div>
        ) : prompts.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
            <small>Start a new chat to build history</small>
          </div>
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`prompt-item ${prompt.pinned ? 'pinned' : ''}`}
              onClick={() => handleSelectPrompt(prompt)}
            >
              <div className="prompt-content">
                <p className="prompt-text">{prompt.userPrompt.substring(0, 50)}...</p>
                <span className="prompt-time">{formatTime(prompt.timestamp)}</span>
              </div>
              <div className="prompt-actions">
                <button
                  className="action-btn pin-btn"
                  title={prompt.pinned ? 'Unpin' : 'Pin'}
                  onClick={(e) => handlePinPrompt(e, prompt.id)}
                >
                  {prompt.pinned ? '📌' : '📍'}
                </button>
                <button
                  className="action-btn delete-btn"
                  title="Delete"
                  onClick={(e) => handleDeletePrompt(e, prompt.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptHistorySidebar;
