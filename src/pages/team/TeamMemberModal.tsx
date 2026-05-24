import { useEffect, useState, ReactNode, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import SafeImage from '../../shared/SafeImage';
import type { CoreTeamMember } from '../../types/api';

export interface TeamMemberModalProps {
  member: CoreTeamMember;
  onClose: () => void;
}

function DynamicIcon({ name, ...props }: { name: keyof typeof LucideIcons; [key: string]: unknown }): ReactNode {
  const Icon = (LucideIcons as Record<string, React.ComponentType<Record<string, unknown>>>)[name] ?? LucideIcons.HelpCircle;
  return <Icon {...(props as Record<string, unknown>)} />;
}

function CopyPopup({ value, onClose }: { value: string; onClose: () => void }): ReactNode {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const handler = (event: globalThis.MouseEvent): void => {
      if (event.target instanceof Element && !event.target.closest('.copy-popup')) {
        onClose();
      }
    };

    window.setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div className="copy-popup">
      <span className="copy-popup-value">{value}</span>
      <button className="copy-popup-btn" onClick={handleCopy}>
        {copied ? '✅ Copied!' : '📋 Copy'}
      </button>
    </div>
  );
}

function getWhatsappDisplay(raw: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith('http') ? raw : raw;
}

function ModalContent({ member, onClose }: { member: CoreTeamMember; onClose: () => void }): ReactNode {
  const [activePopup, setActivePopup] = useState<'whatsapp' | 'email' | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const hasSocial = member.linkedin || member.whatsapp || member.instagram || member.email;
  const whatsappValue = getWhatsappDisplay(member.whatsapp);

  return (
    <div
      className="modal-overlay"
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <DynamicIcon name="X" size={20} />
        </button>

        <div
          className="modal-glow-orb"
          style={{ position: 'absolute', top: '-20px', left: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(238,34,34,0.3) 0%, transparent 70%)', filter: 'blur(10px)', pointerEvents: 'none' }}
        />

        <div style={{ position: 'relative', width: '108px', height: '108px', margin: '0 auto 16px' }}>
          <SafeImage src={member.photo} alt={member.name} className="modal-photo" fallbackType="avatar" />
          <div className="modal-photo-ring" />
        </div>

        <div className="modal-name">{member.name}</div>
        <div className="modal-role">{member.role}</div>

        <div className="modal-info" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="modal-info-row">
            <span className="modal-info-label">🎓 Year</span>
            <span className="modal-info-value">{member.year}</span>
          </div>
          <div className="modal-info-row">
            <span className="modal-info-label">🔬 Branch</span>
            <span className="modal-info-value">{member.branch}</span>
          </div>
          <div className="modal-info-row">
            <span className="modal-info-label">📋 Section</span>
            <span className="modal-info-value">{member.section}</span>
          </div>
        </div>

        {member.achievements && member.achievements.length > 0 && (
          <div className="modal-achievements">
            <div className="modal-achievements-title">🏆 Achievements</div>
            <ul className="modal-achievements-list">
              {member.achievements.map((achievement, index) => (
                <li key={index} className="modal-achievement-item">{achievement}</li>
              ))}
            </ul>
          </div>
        )}

        {member.testimonials && member.testimonials.length > 0 && (
          <div className="modal-testimonials">
            <div className="modal-testimonials-title">💬 Testimonials</div>
            <ul className="modal-testimonials-list">
              {member.testimonials.map((testimonial, index) => (
                <li key={index} className="modal-testimonial-item">
                  <span className="testimonial-text">“{testimonial.text}”</span>
                  <span className="testimonial-author">- {testimonial.author}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasSocial && (
          <div className="modal-social">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-social-btn btn-linkedin"
              >
                🔗 LinkedIn
              </a>
            )}

            {member.whatsapp && (
              <div style={{ position: 'relative' }}>
                <button
                  className="modal-social-btn btn-whatsapp"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActivePopup(activePopup === 'whatsapp' ? null : 'whatsapp');
                  }}
                >
                  💬 WhatsApp
                </button>
                {activePopup === 'whatsapp' && (
                  <CopyPopup value={whatsappValue} onClose={() => setActivePopup(null)} />
                )}
              </div>
            )}

            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-social-btn btn-instagram"
              >
                📸 Instagram
              </a>
            )}

            {member.email && (
              <div style={{ position: 'relative' }}>
                <button
                  className="modal-social-btn btn-contact"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActivePopup(activePopup === 'email' ? null : 'email');
                  }}
                >
                  ✉️ Email
                </button>
                {activePopup === 'email' && (
                  <CopyPopup value={member.email} onClose={() => setActivePopup(null)} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamMemberModal({ member, onClose }: TeamMemberModalProps): ReactNode {
  if (!member) return null;

  return createPortal(
    <ModalContent member={member} onClose={onClose} />,
    document.body
  );
}
