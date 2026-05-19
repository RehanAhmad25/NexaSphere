import { BRAND_LOGO_FULL, BRAND_LOGO_ICON, GL_BAJAJ_LOGO } from './brandAssets';
import { Mail, Heart } from 'lucide-react';

const NEXASPHERE_EMAIL = 'nexasphere@glbajajgroup.org';

export default function Footer({ onAdmin, onProjects, onRoadmaps }) {
  return (
    <footer className="ns-footer">
      <div className="container">
        <div className="ns-footer-inner">
          <div className="ns-footer-divider"/>
          <div className="ns-footer-logos">
            <img src={BRAND_LOGO_ICON} alt="NexaSphere" className="ns-footer-logo-ns ns-footer-logo-mobile" loading="lazy"/>
            <img src={BRAND_LOGO_FULL} alt="NexaSphere" className="ns-nav-logo-ns ns-nav-logo-icon" loading="lazy"/>
            <div style={{width:1,height:24,background:'var(--bdr2)'}}/>
            <img src={GL_BAJAJ_LOGO} alt="GL Bajaj" className="ns-footer-logo-gl" loading="lazy"/>
          </div>
          <p className="ns-footer-text">© {new Date().getFullYear()} <span>NexaSphere</span> — GL Bajaj Group of Institutions, Mathura</p>
          <p className="ns-footer-text">
            <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
            <a href={`mailto:${NEXASPHERE_EMAIL}`} className="ns-footer-email-link">
              {NEXASPHERE_EMAIL}
            </a>
          </p>
          <p className="ns-footer-text ns-footer-built">
            Built with <Heart size={12} fill="currentColor" style={{ display: 'inline', verticalAlign: '-1px' }} /> by the NexaSphere Core Team · <span onClick={onProjects} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Projects Gallery</span> · <span onClick={onRoadmaps} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Learning Roadmaps</span> · <span onClick={onAdmin} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Admin Dashboard</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

