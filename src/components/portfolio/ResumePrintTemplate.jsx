import React, { forwardRef } from 'react';
import { projectsData } from '../../data/projectsData';
import { roadmapData } from '../../data/roadmapData';

const ResumePrintTemplate = forwardRef(({ portfolio }, ref) => {
  if (!portfolio) return null;
  const { username, title, bio, visibleSections, socialLinks, skills, roadmaps, projects } = portfolio;

  // Map project IDs to full project data
  const resolvedProjects = projects?.map(id => projectsData.find(p => p.id === id)).filter(Boolean) || [];

  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff', fontSize: '12pt', lineHeight: 1.5 }}>
      {/* Header */}
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28pt', fontWeight: 'bold' }}>{username}</h1>
        <h2 style={{ margin: '8px 0', fontSize: '14pt', fontWeight: 'normal', color: '#444' }}>{title || 'Tech Specialist & Developer'}</h2>
        
        {/* Contact Links */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '10pt', marginTop: '12px', flexWrap: 'wrap' }}>
          {socialLinks?.email && <span>Email: {socialLinks.email}</span>}
          {socialLinks?.linkedin && <span>LinkedIn: {socialLinks.linkedin}</span>}
          {socialLinks?.github && <span>GitHub: {socialLinks.github}</span>}
          {socialLinks?.twitter && <span>Twitter: {socialLinks.twitter}</span>}
          {socialLinks?.portfolio && <span>Portfolio: {socialLinks.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {bio && (
        <section className="resume-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14pt', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Summary</h3>
          <p style={{ margin: 0 }}>{bio}</p>
        </section>
      )}

      {/* Skills */}
      {visibleSections?.quests && skills && skills.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14pt', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Skills & Technologies</h3>
          <p style={{ margin: 0 }}>{skills.join(' • ')}</p>
        </section>
      )}

      {/* Projects */}
      {visibleSections?.projects && resolvedProjects.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14pt', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>Selected Projects</h3>
          {resolvedProjects.map(proj => (
            <div key={proj.id} className="resume-item" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12pt' }}>{proj.title}</strong>
                <span style={{ fontSize: '10pt', color: '#555' }}>{proj.category}</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '11pt' }}>{proj.shortDesc}</p>
              {proj.techStack && proj.techStack.length > 0 && (
                <p style={{ margin: 0, fontSize: '10pt', color: '#444' }}><strong>Tech:</strong> {proj.techStack.join(', ')}</p>
              )}
              <div style={{ fontSize: '9pt', color: '#666', marginTop: '4px' }}>
                {proj.github && proj.github !== '#' && <span style={{ marginRight: '16px' }}>GitHub: {proj.github}</span>}
                {proj.demo && proj.demo !== '#' && <span>Demo: {proj.demo}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Curriculum/Education */}
      {visibleSections?.roadmaps && roadmaps && roadmaps.length > 0 && (
        <section className="resume-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14pt', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '16px' }}>Education & Curriculum Progress</h3>
          {roadmaps.map(roadmapKey => {
            const data = roadmapData[roadmapKey];
            if (!data) return null;
            return (
              <div key={roadmapKey} className="resume-item" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '11pt' }}>{data.title}</strong>
                  <span style={{ fontSize: '10pt', color: '#555' }}>Completed Modules: {data.nodes?.length || 0}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
});

ResumePrintTemplate.displayName = 'ResumePrintTemplate';

export default ResumePrintTemplate;
