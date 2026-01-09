import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { GUESTS } from '../../../config/config';

interface GuestInputProps {
  value: number;
  error?: string | null;
  clamped?: boolean;
  onChange: (guests: number) => void;
}

/**
 * Guest count input component with validation and clamping feedback.
 * Shows warning when guest count is adjusted to valid range.
 */
export function GuestInput({ value, error, clamped, onChange }: GuestInputProps) {
  return (
    <div class="input-group">
      <label for="guest-count">Estimated Guest Count</label>
      <input
        type="number"
        id="guest-count"
        min={GUESTS.min}
        max={GUESTS.max}
        value={value}
        onChange={(e) => onChange(parseInt((e.target as HTMLInputElement).value) || GUESTS.default)}
        aria-describedby={error || clamped ? "guests-error guests-help" : "guests-help"}
        aria-invalid={error ? "true" : "false"}
        aria-required="true"
        class={error ? "input-error" : ""}
      />
      {error ? (
        <small id="guests-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
          {error}
        </small>
      ) : clamped ? (
        <small id="guests-error" style="color: #f39c12; font-size: 0.875rem; display: block; margin-top: 4px;" role="status">
          Guest count adjusted to valid range: {GUESTS.min}-{GUESTS.max}
        </small>
      ) : (
        <small id="guests-help" style="color: #7f8c8d; font-size: 0.875rem;">
          Valid range: {GUESTS.min}-{GUESTS.max} guests
        </small>
      )}
    </div>
  );
}
