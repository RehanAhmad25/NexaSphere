import React, { useState, useEffect } from 'react';
import { getPinnedPrompts, togglePinPrompt } from '../../lib/promptStore';
import './PinnedChats.css';

const PinnedChats = ({ onSelectPrompt, workspace = 'default' }) => {
  const [pinnedPrompts, setPinnedPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPinnedPrompts();
  }, [workspace]);

  const loadPinnedPrompts = async () => {
    setLoading(true);
    try {
      const pinned = await getPinnedPrompts(workspace);
      setPinnedPrompts(pinned);
    } catch (error) {
      console.error('Error loading pinned prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (e, id) => {
    e.stopPropagation();
    await togglePinPrompt(id);
    loadPinnedPrompts();
  };

  const handleSelectPrompt = (prompt) => {
    onSelectPrompt(prompt);
  };

  if (pinnedPrompts.length === 0) {
    return null;
  }

  return (
    <div className="pinned-chats-container">
      <div className="pinned-header">
        <h4>📌 Pinned Conversations</h4>
        <span className="pin-count">{pinnedPrompts.length}</span>
      </div>
      
      <div className="pinned-list">
        {pinnedPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="pinned-item"
            onClick={() => handleSelectPrompt(prompt)}
          >
            <div className="pinned-content">
              <p className="pinned-text">{prompt.userPrompt.substring(0, 45)}...</p>
              <span className="pinned-icon">📌</span>
            </div>
            <button
              className="unpin-btn"
              title="Unpin"
              onClick={(e) => handleUnpin(e, prompt.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedChats;
