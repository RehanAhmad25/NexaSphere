import { BRAND_LOGO_FULL, BRAND_LOGO_ICON, GL_BAJAJ_LOGO } from './brandAssets';
import { Mail, Heart } from 'lucide-react';

const NEXASPHERE_EMAIL = 'nexasphere@glbajajgroup.org';

export default function Footer() {
  return (
    <footer className="ns-footer">
      <div className="container">
        <div className="ns-footer-inner">
          <div className="ns-footer-divider"/>
          <div className="ns-footer-logos">
            <img src={BRAND_LOGO_ICON} alt="NexaSphere" className="ns-footer-logo-ns ns-footer-logo-mobile"/>
            <img src={BRAND_LOGO_FULL} alt="NexaSphere" className="ns-nav-logo-ns ns-nav-logo-icon"/>
            <div style={{width:1,height:24,background:'var(--bdr2)'}}/>
            <img src={GL_BAJAJ_LOGO} alt="GL Bajaj" className="ns-footer-logo-gl"/>
          </div>
          <p className="ns-footer-text">© {new Date().getFullYear()} <span>NexaSphere</span> — GL Bajaj Group of Institutions, Mathura</p>
          <p className="ns-footer-text">
            <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
            <a href={`mailto:${NEXASPHERE_EMAIL}`} className="ns-footer-email-link">
              {NEXASPHERE_EMAIL}
            </a>
          </p>
          <p className="ns-footer-text ns-footer-built">
            Built with <Heart size={12} fill="currentColor" style={{ display: 'inline', verticalAlign: '-1px' }} /> by the NexaSphere Core Team · Architected by Ayush Sharma
          </p>
        </div>
      </div>
    </footer>
  );
}

