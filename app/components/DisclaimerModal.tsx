import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useEffect, useRef } from 'preact/hooks';
import { INCLUDED_OUR_VENUE, WEDDING_CATEGORIES, FOOD, BAR, EXTERNAL_PLANNER_COST } from '../../config/config';

function focusAndScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (el as HTMLElement).focus?.();
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

interface DisclaimerModalProps {
  onClose: () => void;
}

export function DisclaimerModal({ onClose }: DisclaimerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // DisclaimerModal mounted - removed console.log per logger utility
    // Focus close button when modal opens
    closeButtonRef.current?.focus();

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div class="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-content">
        <button
          ref={closeButtonRef}
          class="modal-close"
          onClick={onClose}
          aria-label="Close disclaimer modal"
        >
          ×
        </button>
        
        <h2 id="modal-title">Assumptions & Disclaimer</h2>
        
        <div class="assumptions-list">
          <h3>Default Assumptions</h3>
          
          <dl>
            <dt>
              <a href="#override-food" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-food'); }}>
                Food & Catering
              </a>
            </dt>
            <dd>
              Base cost: {formatCurrency(FOOD.basePerGuest)}/guest (Buffet style)
              <br />
              Family Style: +{formatCurrency(FOOD.deltasPerGuest.family)}/guest
              <br />
              Plated: +{formatCurrency(FOOD.deltasPerGuest.plated)}/guest
            </dd>
            
            <dt>
              <a href="#bar-service" onClick={(e) => { e.preventDefault(); focusAndScrollTo('bar-service'); }}>
                Bar Service
              </a>
            </dt>
            <dd>
              {BAR.services.map(service => (
                <span key={service.id}>
                  {service.label}: {service.id === 'cashBar' ? 'No charge' :
                    `${formatCurrency(service.perGuestByHour?.[4] || 0)}/guest (4hr example)`}<br />
                </span>
              ))}
            </dd>
            
            <dt>
              <a href="#override-photography" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-photography'); }}>
                Photography
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.photography.default)}</dd>

            <dt>
              <a href="#override-videography" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-videography'); }}>
                Videography
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.videography.default)}</dd>

            <dt>
              <a href="#override-flowers" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-flowers'); }}>
                Flowers & Décor
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.flowers.default)}</dd>

            <dt>
              <a href="#override-djMusic" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-djMusic'); }}>
                DJ/Music
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.djMusic.default)}</dd>

            <dt>
              <a href="#override-invitations" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-invitations'); }}>
                Invitations
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.invitations.default)}</dd>

            <dt>
              <a href="#override-transportation" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-transportation'); }}>
                Transportation
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.transportation.default)}</dd>

            <dt>
              <a href="#override-hairMakeup" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-hairMakeup'); }}>
                Hair & Makeup
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.hairMakeup.default)}</dd>

            <dt>
              <a href="#override-cakeDesserts" onClick={(e) => { e.preventDefault(); focusAndScrollTo('override-cakeDesserts'); }}>
                Cake & Desserts
              </a>
            </dt>
            <dd>{formatCurrency(WEDDING_CATEGORIES.cakeDesserts.default)}</dd>
            
            <dt>
              <a href="#planner-used" onClick={(e) => { e.preventDefault(); focusAndScrollTo('planner-used'); }}>
                External Planner (if selected)
              </a>
            </dt>
            <dd>{formatCurrency(EXTERNAL_PLANNER_COST)}</dd>
          </dl>
          
          <h3>Included at The Wilds & Laural Mill</h3>
          <ul>
            {INCLUDED_OUR_VENUE.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          
          <p>These items are included at <strong>no additional cost</strong> at our venues but typically incur separate charges at other venues.</p>
        </div>
        
        <div class="disclaimer-box">
          <h3>Important Disclaimer</h3>
          <p>
            <strong>This tool provides planning estimates only.</strong> The Wilds and Laural Mill are <strong>not bound</strong> by selections made in this estimator. Final proposals may differ.
          </p>
          <p>
            All pricing shown represents typical costs in the Indianapolis area and may vary based on your specific selections, vendors, and wedding date. Use these estimates as a starting point for your planning, and consult with our team for accurate, personalized quotes.
          </p>
        </div>
        
        <div class="export-buttons">
          <button class="btn btn-primary" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

