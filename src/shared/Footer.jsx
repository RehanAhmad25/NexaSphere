import nexasphereLogo from '../assets/images/logos/nexasphere-logo.png';
import glbajajLogo    from '../assets/images/logos/glbajaj-logo.png';

const NEXASPHERE_EMAIL = 'nexasphere@glbajajgroup.org';

export default function Footer() {
  return (
    <footer className="ns-footer">
      <div className="container">
        <div className="ns-footer-inner">
          <div className="ns-footer-divider"/>
          <div className="ns-footer-logos">
            <img src={nexasphereLogo} alt="NexaSphere" className="ns-footer-logo-ns"/>
            <div style={{width:1,height:24,background:'var(--bdr2)'}}/>
            <img src={glbajajLogo}    alt="GL Bajaj"   className="ns-footer-logo-gl"/>
          </div>
          <p className="ns-footer-text">© {new Date().getFullYear()} <span>NexaSphere</span> — GL Bajaj Group of Institutions, Mathura</p>
          <p className="ns-footer-text">
            📧{' '}
            <a href={`mailto:${NEXASPHERE_EMAIL}`} className="ns-footer-email-link">
              {NEXASPHERE_EMAIL}
            </a>
          </p>
          <p className="ns-footer-text ns-footer-built">
            Built with ❤️ by the NexaSphere Core Team · Architected by Ayush Sharma
          </p>
        </div>
      </div>
    </footer>
  );
}
