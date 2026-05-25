import { type KeyboardEvent, type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TeamMemberModal from './TeamMemberModal';
import { IconSpark } from '../../shared/Icons';
import type { CoreTeamMember } from '../../types/api';
import type { TeamSectionProps } from '../../types/components';

const ANTI_GRAVITY_DELAYS = [-0.0, -2.1, -4.2, -1.0, -3.3, -5.5, -0.7, -6.1, -2.8, -4.9, -1.6, -3.8];

function MemberCard({ member, idx, onClick }: { 
  member: CoreTeamMember;
  idx: number;
  onClick: (member: CoreTeamMember) => void;
}): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.animationPlayState = 'paused';
    card.style.transform = `translateY(-14px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg) scale(1.06)`;
  };

  const handleMouseLeave = (): void => {
    const card = ref.current;
    if (!card) return;

    card.style.transform = '';
    card.style.animationPlayState = '';
  };

  const handleClick = (): void => {
    const card = ref.current;
    if (card) {
      card.style.transform = 'scale(.9)';
      window.setTimeout(() => {
        card.style.transform = '';
      }, 140);
    }

    window.setTimeout(() => onClick(member), 110);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  return (
    <div
      ref={ref}
      className="team-card shimmer mag-card"
      style={{ animationDelay: `${ANTI_GRAVITY_DELAYS[idx % ANTI_GRAVITY_DELAYS.length]}s` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="team-card-photo-wrap">
        <img src={member.photo} alt={member.name} className="team-card-photo" />
      </div>
      <div className="team-card-name">{member.name}</div>
      <div className="team-card-role">{member.role}</div>
      <div className="team-card-chips">
        <span className="chip-branch">{member.branch}</span>
        <span className="chip-section">§{member.section}</span>
      </div>
      <div className="team-card-hint">Click to view ↗</div>
      <div className="corner-tl" />
      <div className="corner-br" />
    </div>
  );
}

export default function TeamSection({ onApply }: TeamSectionProps): ReactNode {
  const [selectedMember, setSelectedMember] = useState<CoreTeamMember | null>(null);
  const [members, setMembers] = useState<CoreTeamMember[]>([]);

  useEffect(() => {
    let alive = true;
    const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
    const url = base ? `${base}/api/content/team` : '/api/content/team';

    fetch(url)
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('Failed to load team'))))
      .then(data => {
        if (alive && Array.isArray(data?.members)) {
          setMembers(data.members);
        }
      })
      .catch(() => {
        if (alive) setMembers([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('#section-team .pop-flip, #section-team .pop-in, #section-team .pop-word');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fired');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });

    elements.forEach(element => observer.observe(element));

    const fallback = window.setTimeout(() => {
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          element.classList.add('fired');
        }
      });
    }, 120);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <section className="section" id="section-team">
      <div className="container">
        <div className="section-heading ns-reveal">
          <span className="cin-section-label pop-in">GL Bajaj Group of Institutions · Mathura</span>
          <h2 className="section-title pop-word">Core Team</h2>
          <p className="section-subtitle pop-in" style={{ animationDelay: '0.1s' }}>
            The Minds Behind NexaSphere
          </p>
        </div>

        <div className="team-grid cin-container">
          {members.map((member, index) => (
            <MemberCard key={member.id} member={member} idx={index} onClick={setSelectedMember} />
          ))}
        </div>

        <div className="ns-reveal-scale join-banner">
          <div className="corner-tl" />
          <div className="corner-br" />
          <h3>Want to Join NexaSphere?</h3>
          <p>
            We&apos;re looking for passionate students to drive NexaSphere forward. Fill in the form and we&apos;ll reach out!
          </p>
          <button
            type="button"
            onClick={() => onApply && onApply()}
            className="btn btn-join btn-ripple"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Apply Here <IconSpark />
          </button>
        </div>
      </div>

      {selectedMember ? <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} /> : null}
    </section>
  );
}
