import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, ExternalLink, X, Tag, Users } from 'lucide-react';
import { projectsData } from '../../data/projectsData';
import SafeImage from '../../shared/SafeImage';
import '../../styles/projects.css';

const CATEGORIES = ['All', 'Web App', 'Mobile', 'Machine Learning', 'Cybersecurity', 'UI/UX Design'];

export default function ProjectsPage({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter projects based on category
  const filteredProjects = activeCategory === 'All'
    ? projectsData
    : projectsData.filter(project => project.category === activeCategory);

  // Handle escape key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProject]);

  return (
    <div className="projects-page-container">
      {/* Header section */}
      <div className="projects-header">
        <button className="btn btn-outline back-btn" onClick={onBack} aria-label="Go back to Home">
          ← Back to Home
        </button>
        <h1 className="projects-title">Project Showcase</h1>
        <p className="projects-subtitle">Discover the innovative solutions built by the NexaSphere community.</p>
      </div>

      {/* Category Filters */}
      <div className="category-filters" role="tablist" aria-label="Project Categories">
        {CATEGORIES.map(category => (
          <button
            key={category}
            role="tab"
            aria-selected={activeCategory === category}
            className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Gallery Grid */}
      <motion.div layout className="projects-grid">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={project.id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedProject(project);
                }
              }}
              aria-label={`View details for ${project.title}`}
            >
              <div className="project-card-image">
                <SafeImage src={project.image} alt={project.title} loading="lazy" fallbackType="project" />
                <div className="project-card-overlay">
                  <span className="view-details-text">View Details</span>
                </div>
              </div>
              <div className="project-card-content">
                <span className="project-category">{project.category}</span>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.shortDesc}</p>
                <div className="project-tech-stack">
                  {project.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="tech-pill">{tech}</span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="tech-pill">+{project.techStack.length - 3}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredProjects.length === 0 && (
          <div className="no-projects-msg">
            <p>No projects found in this category.</p>
          </div>
        )}
      </motion.div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="modal-overlay projects-modal-overlay" onClick={() => setSelectedProject(null)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-box project-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close" 
                onClick={() => setSelectedProject(null)} 
                aria-label="Close modal"
                autoFocus
              >
                <X size={20} />
              </button>

              <SafeImage src={selectedProject.image} alt={selectedProject.title} className="project-modal-image" fallbackType="project" />
              
              <div className="project-modal-header">
                <span className="project-category">{selectedProject.category}</span>
                <h2 id="modal-title" className="project-modal-title">{selectedProject.title}</h2>
              </div>

              <div className="project-modal-body">
                <p className="project-modal-desc">{selectedProject.longDesc}</p>
                
                <div className="project-modal-section">
                  <h4 className="section-title"><Tag size={16} /> Tech Stack</h4>
                  <div className="project-tech-stack">
                    {selectedProject.techStack.map(tech => (
                      <span key={tech} className="tech-pill">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="project-modal-section">
                  <h4 className="section-title"><Users size={16} /> Team</h4>
                  <div className="project-team-list">
                    {selectedProject.team.map((member, idx) => (
                      <div key={idx} className="team-member">
                        <SafeImage src={member.photo} alt={member.name} className="team-member-photo" fallbackType="avatar" />
                        <div className="team-member-info">
                          <span className="team-member-name">{member.name}</span>
                          <span className="team-member-role">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="project-modal-footer">
                {selectedProject.github && selectedProject.github !== '#' && (
                  <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline" aria-label="View Source Code on GitHub">
                    <Code size={18} /> Source Code
                  </a>
                )}
                {selectedProject.demo && selectedProject.demo !== '#' && (
                  <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer" className="btn btn-primary" aria-label="View Live Demo">
                    <ExternalLink size={18} /> Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
