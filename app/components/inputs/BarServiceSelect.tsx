import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { BarService, BAR } from '../../../config/config';

interface BarDurationSelectProps {
  value: number;
  onChange: (duration: number) => void;
}

/**
 * Bar duration selector component.
 * Allows selection of bar service duration from 1-6 hours.
 */
export function BarDurationSelect({ value, onChange }: BarDurationSelectProps) {
  return (
    <div class="input-group">
      <label for="bar-duration">Bar Duration (hours)</label>
      <select
        id="bar-duration"
        value={value}
        onChange={(e) => onChange(parseInt((e.target as HTMLSelectElement).value))}
      >
        {[1, 2, 3, 4, 5, 6].map(hours => (
          <option key={hours} value={hours}>
            {hours} hour{hours !== 1 ? 's' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

interface BarServiceSelectProps {
  value: BarService;
  barDuration: number;
  onChange: (service: BarService) => void;
}

/**
 * Bar service type selector component.
 * Displays available bar service options with per-guest pricing.
 */
export function BarServiceSelect({ value, barDuration, onChange }: BarServiceSelectProps) {
  const selectedService = BAR.services.find(s => s.id === value);

  return (
    <div class="input-group input-group-bar-service">
      <label for="bar-service">Bar Service Type</label>
      <select
        id="bar-service"
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value as BarService)}
        title={selectedService?.label || ''}
      >
        {BAR.services.map(service => {
          const cost = service.id === 'cashBar' ? 'No charge' :
            `$${service.perGuestByHour?.[barDuration as keyof typeof service.perGuestByHour] || 0}/guest`;
          const shortLabel = getShortLabel(service.label);
          return (
            <option key={service.id} value={service.id} title={`${service.label} (${cost})`}>
              {shortLabel} ({cost})
            </option>
          );
        })}
      </select>
    </div>
  );
}

/**
 * Shortens bar service labels for better display in select options.
 */
function getShortLabel(label: string): string {
  return label
    .replace('Open Beer, Wine & Premium Spirits', 'Premium Spirits')
    .replace('Open Beer, Wine & Elite Spirits', 'Elite Spirits')
    .replace('Open Beer & Wine', 'Beer & Wine');
}
