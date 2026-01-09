import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface DateInputProps {
  value: string;
  error?: string | null;
  onChange: (date: string) => void;
}

/**
 * Date input component for selecting the wedding date.
 * Displays validation errors and help text about pricing variations.
 */
export function DateInput({ value, error, onChange }: DateInputProps) {
  return (
    <div class="input-group input-group-date">
      <label for="wedding-date">Wedding Date</label>
      <input
        type="date"
        id="wedding-date"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        aria-describedby={error ? "date-error date-help" : "date-help"}
        aria-invalid={error ? "true" : "false"}
        aria-required="true"
        class={error ? "input-error" : ""}
      />
      {error ? (
        <small id="date-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
          {error}
        </small>
      ) : (
        <small id="date-help" style="color: #7f8c8d; font-size: 0.875rem;">
          Pricing varies by day of week and season
        </small>
      )}
    </div>
  );
}
