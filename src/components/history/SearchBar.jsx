import React, { useState, useCallback } from 'react';
import { searchPrompts } from '../../lib/promptStore';
import './SearchBar.css';

const SearchBar = ({ onSelectPrompt, workspace = 'default' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(
    async (searchQuery) => {
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const foundPrompts = await searchPrompts(searchQuery, workspace);
        setResults(foundPrompts);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [workspace]
  );

  const handleSelectResult = (prompt) => {
    onSelectPrompt(prompt);
    setQuery('');
    setShowResults(false);
  };

  const formatPreview = (text, maxLen = 60) => {
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search conversations..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowResults(true)}
        />
        {isSearching && <span className="search-spinner">⟳</span>}
        {query && (
          <button
            className="clear-search"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.slice(0, 5).map((prompt) => (
            <div
              key={prompt.id}
              className="result-item"
              onClick={() => handleSelectResult(prompt)}
            >
              <div className="result-content">
                <p className="result-query">{formatPreview(prompt.userPrompt)}</p>
                <p className="result-response">{formatPreview(prompt.botResponse)}</p>
              </div>
            </div>
          ))}
          {results.length > 5 && (
            <div className="result-more">
              +{results.length - 5} more results
            </div>
          )}
        </div>
      )}

      {showResults && query && results.length === 0 && !isSearching && (
        <div className="search-empty">
          <p>No results found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
