import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState } from 'preact/hooks';
import { OTHER_VENUE_CATEGORIES, OTHER_VENUE_DEFAULTS, BarService } from '../../config/config';
import { getBarSetupFee, getDefaultBarCost } from '../lib/defaults';
import { Tooltip } from './Tooltip';

interface OtherVenueOverridesPanelProps {
  overrides: Record<string, number>;
  onOverrideChange: (category: string, value: number) => void;
  onResetOverrides: () => void;
  currentVenueBarService: BarService;
  currentVenueBarDuration: number;
  inline?: boolean; // If true, render without accordion wrapper
}

export function OtherVenueOverridesPanel({
  overrides,
  onOverrideChange,
  onResetOverrides,
  currentVenueBarService,
  currentVenueBarDuration,
  inline = false,
}: OtherVenueOverridesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate default values based on current venue settings
  const defaultBarSetupFee = getBarSetupFee(currentVenueBarDuration);
  const defaultBarService = getDefaultBarCost(150, currentVenueBarService, currentVenueBarDuration); // Use 150 as default for display

  // Get defaults for each category
  const getDefault = (key: string): number => {
    if (key === 'venueFee') return 7000; // Will be calculated dynamically, but show a default
    if (key === 'barSetupFee') return defaultBarSetupFee;
    if (key === 'barService') return defaultBarService;
    if (key === 'tablesChairs') return OTHER_VENUE_DEFAULTS.tablesChairs;
    if (key === 'coreDecor') return OTHER_VENUE_DEFAULTS.coreDecor;
    if (key === 'dayOfCoordination') return OTHER_VENUE_DEFAULTS.dayOfCoordination;
    if (key === 'ceremonyAudio') return OTHER_VENUE_DEFAULTS.ceremonyAudio;
    if (key === 'setupTeardown') return OTHER_VENUE_DEFAULTS.setupTeardown;
    if (key === 'cleaning') return OTHER_VENUE_DEFAULTS.cleaning;
    return 0;
  };

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onOverrideChange(key, numValue);
    }
  };

  const content = (
    <>
      <p style="color: #6d4c41; margin-bottom: 16px; font-size: 0.95rem;">
        Adjust the costs for a typical "Other Venue" to match venues you're comparing. 
        These values default to our bar settings and typical market rates.
      </p>
      
      <div class="overrides-grid">
        {Object.entries(OTHER_VENUE_CATEGORIES).map(([key, category]) => {
          const defaultValue = getDefault(key);
          return (
            <div key={key} class="input-group">
              <label for={`other-venue-override-${key}`}>
                {category.name}
                <Tooltip text={category.tooltip} />
                <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                  Default: ${defaultValue.toLocaleString()}
                </small>
              </label>
              <input
                type="number"
                id={`other-venue-override-${key}`}
                min="0"
                step="50"
                value={overrides[key] ?? defaultValue}
                onChange={(e) => handleInputChange(key, (e.target as HTMLInputElement).value)}
                placeholder={defaultValue.toString()}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        class="btn-secondary"
        onClick={onResetOverrides}
        style="margin-top: 16px;"
      >
        Reset to Defaults
      </button>
    </>
  );

  if (inline) {
    return (
      <div style="margin-top: 20px;">
        <h3 style="margin-bottom: 16px; font-size: 1.1rem; font-weight: 600;">Customize "Other Venue" Costs</h3>
        {content}
      </div>
    );
  }

  return (
    <div class="accordion" style="margin-top: 20px;">
      <div
        class="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="other-venue-overrides-content"
      >
        <span>Customize "Other Venue" Costs</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div
        id="other-venue-overrides-content"
        class={`accordion-content ${!isOpen ? 'collapsed' : ''}`}
      >
        {content}
      </div>
    </div>
  );
}



