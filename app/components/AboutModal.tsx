import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useEffect, useRef } from 'preact/hooks';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // AboutModal mounted - removed console.log per logger utility
    closeButtonRef.current?.focus();

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
    <div class="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div class="modal-content">
        <button
          ref={closeButtonRef}
          class="modal-close"
          onClick={onClose}
          aria-label="Close about modal"
        >
          ×
        </button>
        
        <h2 id="about-title">About This Tool</h2>
        
        <p>
          This interactive wedding cost estimator helps you plan your budget for weddings at 
          <strong> The Wilds</strong> or <strong> Laural Mill</strong>. Compare our all-inclusive 
          pricing against typical venues that charge separately for planning, setup, tables, chairs, 
          and more.
        </p>
        
        <h3>Features</h3>
        <ul>
          <li>Real-time cost calculations based on guest count, date, and meal style</li>
          <li>Side-by-side comparison with typical "other venues"</li>
          <li>Editable assumptions for all categories</li>
          <li>Export estimates as CSV or print/save as PDF</li>
          <li>Fully accessible and keyboard-navigable</li>
          <li>Works on all devices (desktop, tablet, mobile)</li>
        </ul>
        
        <h3>How to Use</h3>
        <ol>
          <li>Enter your wedding date and estimated guest count</li>
          <li>Select your preferred meal style and bar service</li>
          <li>Toggle "Compare with Other Venue" to see side-by-side pricing</li>
          <li>Adjust percentages in Advanced Settings if needed</li>
          <li>Export or print your estimate</li>
        </ol>
        
        <p style="margin-top: 20px;">
          <strong>Note:</strong> All pricing shown represents typical costs in the Indianapolis area 
          and may vary based on your specific selections, vendors, and wedding date. Use these estimates 
          as a starting point for your planning.
        </p>
      </div>
    </div>
  );
}

