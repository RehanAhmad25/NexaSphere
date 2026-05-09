import { useRef } from 'react';
import { activities } from '../../data/activitiesData';
import { DynamicIcon } from '../../shared/Icons';

const ANTI_GRAVITY_DELAYS = [0, -2.1, -4.2, -1.0, -3.3, -5.5, -0.7, -6.1];
const TILT_ANGLE = 16;
const TILT_SCALE = 1.04;
const CLICK_SCALE_DELAY = 130;
const NAVIGATION_DELAY = 160;

function ActivityCard({ a, idx, onNav }) {
  const isEven = idx % 2 === 0;

  return (
    <div className="timeline-item">
      <div className="timeline-dot" />
      <div
        className={`timeline-card shimmer ${isEven ? 'pop-left' : 'pop-right'} clickable`}
        style={{ animationDelay: `${idx * 0.1}s`, cursor: 'none' }}
        onClick={() => onNav('activity', a.title)}
      >
        <div className="timeline-event-header">
          <DynamicIcon name={a.icon} size={24} />
          <div className="timeline-event-name">{a.title}</div>
          <span className="view-details-badge">Explore →</span>
        </div>
        <p className="timeline-event-desc">{a.description}</p>
        <div className="timeline-badges">
          {a.tags?.map(t => (
            <span key={t} className="tag-badge">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesSection({ onNavigate }) {
  return (
    <section className="section" id="section-activities">
      <div className="container">
        <div className="ns-reveal">
          <h2 className="section-title pop-word">Our Activities</h2>
          <p className="section-subtitle pop-in" style={{ animationDelay: '0.1s' }}>
            A systematic journey through tech & innovation
          </p>
        </div>
        
        <div className="events-timeline">
          {activities.map((a, i) => (
            <ActivityCard key={a.id} a={a} idx={i} onNav={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
