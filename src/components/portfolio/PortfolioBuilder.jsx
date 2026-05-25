import React, { useState, useEffect } from 'react';
import { projectsData } from '../../data/projectsData';
import { roadmapData } from '../../data/roadmapData';
import { RepoCardSkeleton } from '../ui/skeleton/RepoCardSkeleton';

export default function PortfolioBuilder() {
  const [username, setUsername] = useState('');
  const [passkey, setPasskey] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('glassmorphic');
  const [customDomain, setCustomDomain] = useState('');
  
  // Section Visibilities
  const [visibleSections, setVisibleSections] = useState({
    quests: true,
    roadmaps: true,
    projects: true
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    resume: ''
  });

  // SEO Metadata
  const [seoMetadata, setSeoMetadata] = useState({
    title: '',
    description: ''
  });

  // Selected Data Elements to showcase
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedRoadmaps, setSelectedRoadmaps] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [customProjects, setCustomProjects] = useState([]);

  // GitHub Fetching States
  const [ghUsername, setGhUsername] = useState('');
  const [isFetchingGh, setIsFetchingGh] = useState(false);
  const [ghRepos, setGhRepos] = useState([]);
  const [ghError, setGhError] = useState('');

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract all unique skills from roadmapData
  const availableSkills = Object.values(roadmapData).reduce((acc, roadmap) => {
    roadmap.nodes.forEach(node => {
      if (node.concepts) {
        node.concepts.forEach(concept => {
          if (!acc.includes(concept)) acc.push(concept);
        });
      }
    });
    return acc;
  }, []);

  // Extract all roadmaps domains
  const availableRoadmaps = Object.entries(roadmapData).map(([key, value]) => ({
    key,
    title: value.title
  }));

  // Extract all available projects
  const availableProjects = projectsData.map(p => ({
    id: p.id,
    title: p.title
  }));

  // Fetch initial config if username changes
  const handleLoadConfig = async () => {
    if (!username || username.length < 3) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
      const url = base ? `${base}/api/portfolio/${username}` : `/api/portfolio/${username}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || '');
        setBio(data.bio || '');
        setTheme(data.theme || 'glassmorphic');
        setCustomDomain(data.customDomain || '');
        setVisibleSections(data.visibleSections || { quests: true, roadmaps: true, projects: true });
        setSocialLinks(data.socialLinks || { github: '', linkedin: '', twitter: '', resume: '' });
        setSeoMetadata(data.seoMetadata || { title: '', description: '' });
        setSelectedSkills(data.skills || []);
        setSelectedRoadmaps(data.roadmaps || []);
        setSelectedProjects(data.projects || []);
        setCustomProjects(data.customProjects || []);
        setSuccessMsg('Existing portfolio configuration found and loaded!');
      }
    } catch (err) {
      // Portfolio doesn't exist yet, ignore
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!passkey || passkey.length < 4) {
      setErrorMsg('Passkey must be at least 4 characters long.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const payload = {
        username,
        passkey,
        title,
        bio,
        theme,
        customDomain,
        visibleSections,
        socialLinks,
        seoMetadata,
        skills: selectedSkills,
        roadmaps: selectedRoadmaps,
        projects: selectedProjects,
        customProjects
      };

      const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
      const url = base ? `${base}/api/portfolio` : `/api/portfolio`;
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save portfolio.');
      }

      setSuccessMsg('Portfolio built and synchronized successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleRoadmap = (roadmapKey) => {
    setSelectedRoadmaps(prev =>
      prev.includes(roadmapKey) ? prev.filter(r => r !== roadmapKey) : [...prev, roadmapKey]
    );
  };

  const toggleProject = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(p => p !== projectId) : [...prev, projectId]
    );
  };

  const fetchGithubRepos = async () => {
    if (!ghUsername) return;
    setIsFetchingGh(true);
    setGhError('');
    try {
      const res = await fetch(`https://api.github.com/users/${ghUsername}/repos?sort=updated&per_page=30`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('GitHub user not found.');
        if (res.status === 403) throw new Error('GitHub API rate limit exceeded.');
        throw new Error('Failed to fetch repositories.');
      }
      const data = await res.json();
      setGhRepos(data);
    } catch (err) {
      setGhError(err.message);
    } finally {
      setIsFetchingGh(false);
    }
  };

  const toggleGithubRepo = (repo) => {
    setCustomProjects(prev => {
      const exists = prev.find(p => p.id === repo.id);
      if (exists) {
        return prev.filter(p => p.id !== repo.id);
      } else {
        const customProj = {
          id: repo.id,
          title: repo.name,
          shortDesc: repo.description || 'GitHub Repository',
          category: 'Open Source',
          techStack: repo.language ? [repo.language] : [],
          github: repo.html_url,
          demo: repo.homepage || '#',
          stars: repo.stargazers_count
        };
        return [...prev, customProj];
      }
    });
  };

  const getPortfolioUrl = () => {
    return `${window.location.origin}/p/${username}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPortfolioUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="portfolio-builder-container">
      <div className="builder-header">
        <h1 className="builder-title">Portfolio Builder</h1>
        <p className="builder-subtitle">
          Instantly generate and customize a stunning developer showcase page directly from your NexaSphere metrics and community milestones.
        </p>
      </div>

      <div className="builder-workspace">
        {/* Controls Panel */}
        <form onSubmit={handleSave} className="builder-panel">
          
          {/* Identity & Credentials */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              1. Registry Credentials
            </h3>
            
            <div className="form-group">
              <label htmlFor="username-input" className="form-label">Username</label>
              <input
                id="username-input"
                type="text"
                placeholder="e.g. johndoe"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                onBlur={handleLoadConfig}
                required
              />
              <span className="switch-subtext">Used as your public showcase URL: nexasphere.com/p/your_username</span>
            </div>

            <div className="form-group">
              <label htmlFor="passkey-input" className="form-label">Passkey</label>
              <input
                id="passkey-input"
                type="password"
                placeholder="4+ digit secret passkey"
                className="form-input"
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                required
              />
              <span className="switch-subtext">Required to update this portfolio in the future. Keep it safe.</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              2. Profile Information
            </h3>

            <div className="form-group">
              <label htmlFor="title-input" className="form-label">Professional Title</label>
              <input
                id="title-input"
                type="text"
                placeholder="e.g. Full Stack Web & AI Developer"
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio-input" className="form-label">Bio Narrative Summary</label>
              <textarea
                id="bio-input"
                rows="4"
                placeholder="Briefly showcase your passion, tech specialization, and developer goals..."
                className="form-textarea"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Style Customizer */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6V18Z" />
              </svg>
              3. Visual Theme
            </h3>
            
            <div className="theme-selector-grid">
              {[
                { id: 'glassmorphic', label: 'Glassmorphic' },
                { id: 'cyberpunk', label: 'Cyberpunk' },
                { id: 'minimalist-light', label: 'Light' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-card ${theme === t.id ? 'active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              4. Section Visibility
            </h3>

            <div className="switch-group">
              <div className="switch-label-container">
                <span className="form-label" style={{ fontSize: '0.85rem' }}>Skills & Quests</span>
                <span className="switch-subtext">Showcase tech badges and acquired capabilities</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibleSections.quests}
                  onChange={e => setVisibleSections(prev => ({ ...prev, quests: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="switch-group">
              <div className="switch-label-container">
                <span className="form-label" style={{ fontSize: '0.85rem' }}>Active Roadmaps</span>
                <span className="switch-subtext">Display curriculum progress graphics</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibleSections.roadmaps}
                  onChange={e => setVisibleSections(prev => ({ ...prev, roadmaps: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="switch-group">
              <div className="switch-label-container">
                <span className="form-label" style={{ fontSize: '0.85rem' }}>Collaborative Projects</span>
                <span className="switch-subtext">Feature completed workspace projects</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={visibleSections.projects}
                  onChange={e => setVisibleSections(prev => ({ ...prev, projects: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Social Connections */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              5. Connect Hub
            </h3>

            <div className="form-group">
              <label htmlFor="github-input" className="form-label">GitHub Profile</label>
              <input
                id="github-input"
                type="url"
                placeholder="https://github.com/..."
                className="form-input"
                value={socialLinks.github}
                onChange={e => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin-input" className="form-label">LinkedIn Profile</label>
              <input
                id="linkedin-input"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="form-input"
                value={socialLinks.linkedin}
                onChange={e => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="twitter-input" className="form-label">Twitter / X Profile</label>
              <input
                id="twitter-input"
                type="url"
                placeholder="https://x.com/..."
                className="form-input"
                value={socialLinks.twitter}
                onChange={e => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="resume-input" className="form-label">Resume Link</label>
              <input
                id="resume-input"
                type="url"
                placeholder="Google Drive, Dropbox, or custom resume link"
                className="form-input"
                value={socialLinks.resume}
                onChange={e => setSocialLinks(prev => ({ ...prev, resume: e.target.value }))}
              />
            </div>
          </div>

          {/* Achievement Customizer Checklist Panels */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              6. Display Achievements
            </h3>

            <div className="form-group">
              <label className="form-label">Select Skills to Showcase</label>
              <div className="checklist-grid" role="group" aria-label="Skills options">
                {availableSkills.map(skill => {
                  const isActive = selectedSkills.includes(skill);
                  return (
                    <label key={skill} className={`checklist-item ${isActive ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleSkill(skill)}
                      />
                      {skill}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Select Active Roadmaps</label>
              <div className="checklist-grid" role="group" aria-label="Roadmaps options">
                {availableRoadmaps.map(roadmap => {
                  const isActive = selectedRoadmaps.includes(roadmap.key);
                  return (
                    <label key={roadmap.key} className={`checklist-item ${isActive ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleRoadmap(roadmap.key)}
                      />
                      {roadmap.title}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Select Featured Projects</label>
              <div className="checklist-grid" role="group" aria-label="Projects options">
                {availableProjects.map(project => {
                  const isActive = selectedProjects.includes(project.id);
                  return (
                    <label key={project.id} className={`checklist-item ${isActive ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleProject(project.id)}
                      />
                      {project.title}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--bdr2)' }}>
              <label className="form-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                Sync with GitHub (Optional)
              </label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="GitHub username..."
                  className="form-input"
                  value={ghUsername}
                  onChange={e => setGhUsername(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={fetchGithubRepos}
                  disabled={isFetchingGh || !ghUsername}
                >
                  {isFetchingGh ? 'Fetching...' : 'Fetch Repos'}
                </button>
              </div>
              
              {ghError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px' }}>{ghError}</div>
              )}

              {isFetchingGh ? (
                <div className="checklist-grid" role="group" aria-label="Loading GitHub Repositories">
                  <RepoCardSkeleton count={3} />
                </div>
              ) : ghRepos.length > 0 && (
                <div className="checklist-grid" role="group" aria-label="GitHub Repositories">
                  {ghRepos.map(repo => {
                    const isActive = customProjects.some(p => p.id === repo.id);
                    return (
                      <label key={repo.id} className={`checklist-item ${isActive ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleGithubRepo(repo)}
                          />
                          <span style={{ fontWeight: 'bold' }}>{repo.name}</span>
                          {repo.stargazers_count > 0 && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.8 }}>★ {repo.stargazers_count}</span>
                          )}
                        </div>
                        {repo.language && (
                          <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px', paddingLeft: '24px' }}>{repo.language}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SEO & Optimization metadata */}
          <div className="builder-section-card">
            <h3 className="builder-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--c1b)' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              7. SEO Optimization
            </h3>

            <div className="form-group">
              <label htmlFor="seo-title" className="form-label">Custom Meta Title</label>
              <input
                id="seo-title"
                type="text"
                placeholder="e.g. John Doe | Full Stack Engineer Showcase"
                className="form-input"
                value={seoMetadata.title}
                onChange={e => setSeoMetadata(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="seo-desc" className="form-label">Custom Meta Description</label>
              <textarea
                id="seo-desc"
                rows="2"
                placeholder="Compelling page description for search engines and social shares..."
                className="form-textarea"
                value={seoMetadata.description}
                onChange={e => setSeoMetadata(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: 'var(--r2)', fontWeight: 'bold' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div role="alert" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '12px', borderRadius: 'var(--r2)', fontWeight: 'bold' }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Builder Action Toolbar */}
          <div className="builder-actions">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.05rem',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              {isSaving ? 'Synchronizing Workspace...' : 'Build & Publish Portfolio'}
            </button>
            
            {successMsg && username && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCopyLink}
                  style={{ flex: 1, padding: '10px' }}
                >
                  {copied ? 'Copied Showcase Link!' : 'Copy Public URL'}
                </button>
                <a
                  href={`/p/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Open Showcase Page
                </a>
              </div>
            )}
          </div>

        </form>

        {/* Live Preview Panel */}
        <div className="preview-container">
          <span className="preview-badge">
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--c1b)', animation: 'pulse 1.5s infinite' }}></span>
            Real-time Live Sandbox Preview
          </span>

          <div className="preview-frame">
            <div style={{ height: '100%', overflowY: 'auto', padding: '24px' }} className={`theme-${theme} portfolio-shell`}>
              <div className="portfolio-intro" style={{ flexDirection: 'column', textAlign: 'center', gap: '12px' }}>
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username || 'preview'}`}
                  alt="avatar"
                  className="portfolio-avatar"
                  style={{ width: '80px', height: '80px' }}
                />
                <div className="portfolio-bio-col">
                  <h2 className="portfolio-name" style={{ fontSize: '1.6rem', margin: 0 }}>{username ? `@${username}` : 'Creative Developer'}</h2>
                  <div className="portfolio-title" style={{ fontSize: '0.95rem', margin: '4px 0 8px 0' }}>{title || 'Tech Specialist & Builder'}</div>
                  <p className="portfolio-bio-text" style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: '0 auto', maxWidth: '400px' }}>
                    {bio || 'Define registry credentials and profiles inside the Builder on the left to see your stunning web portfolio render dynamically in this live preview frame.'}
                  </p>
                </div>
              </div>

              {/* Social Link Previews */}
              <div className="portfolio-socials" style={{ justifyContent: 'center', gap: '10px', margin: '14px 0' }}>
                {['github', 'linkedin', 'twitter', 'resume'].map(soc => {
                  const url = socialLinks[soc];
                  if (!url) return null;
                  return (
                    <span key={soc} className="portfolio-social-btn" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {soc === 'github' && 'GH'}
                      {soc === 'linkedin' && 'LN'}
                      {soc === 'twitter' && 'X'}
                      {soc === 'resume' && 'CV'}
                    </span>
                  );
                })}
              </div>

              {/* Showcase list items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                {visibleSections.quests && selectedSkills.length > 0 && (
                  <div className="portfolio-panel" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid var(--bdr2)', paddingBottom: '6px', marginBottom: '10px' }}>⚡ Certified Tech Capabilities</div>
                    <div className="portfolio-pills-list">
                      {selectedSkills.map(sk => (
                        <span key={sk} className="portfolio-pill" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                )}

                {visibleSections.roadmaps && selectedRoadmaps.length > 0 && (
                  <div className="portfolio-panel" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid var(--bdr2)', paddingBottom: '6px', marginBottom: '10px' }}>📌 Active Academic Paths</div>
                    <div className="portfolio-roadmaps-list" style={{ gap: '8px' }}>
                      {selectedRoadmaps.map(rm => (
                        <div key={rm} className="portfolio-roadmap-card" style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{roadmapData[rm]?.title || rm}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>In Progress</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visibleSections.projects && selectedProjects.length > 0 && (
                  <div className="portfolio-panel" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid var(--bdr2)', paddingBottom: '6px', marginBottom: '10px' }}>⚙️ Federated Workspaces</div>
                    <div className="portfolio-roadmaps-list" style={{ gap: '8px' }}>
                      {selectedProjects.map(proj => {
                        const project = projectsData.find(p => p.id === proj);
                        return (
                          <div key={proj} className="portfolio-roadmap-card" style={{ padding: '8px 12px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{project?.title || proj}</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{project?.category || 'Community Project'}</span>
                          </div>
                        );
                      })}
                      {customProjects.map(proj => (
                        <div key={proj.id} className="portfolio-roadmap-card" style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{proj.title}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>GitHub Import</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
