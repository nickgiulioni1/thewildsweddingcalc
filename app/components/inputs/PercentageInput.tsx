import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState, useCallback } from 'preact/hooks';
import { PERCENTAGES } from '../../../config/config';

export interface PercentageFieldConfig {
  id: string;
  label: string;
  value: number;
  error?: string | null;
  helpText?: string;
  allowOver100?: boolean;
  /** Show warning when value was clamped */
  wasClamped?: boolean;
  onChange: (value: number) => void;
}

interface PercentageInputProps extends PercentageFieldConfig {}

/**
 * Clamps a value to the specified range and returns info about clamping.
 */
function clampPercentage(value: number, allowOver100: boolean): { clamped: number; wasClamped: boolean } {
  const min = 0;
  const max = allowOver100 ? Infinity : 100;

  if (value < min) return { clamped: min, wasClamped: true };
  if (value > max) return { clamped: max, wasClamped: true };
  return { clamped: value, wasClamped: false };
}

/**
 * Single percentage input field with validation, error display, and clamping feedback.
 * Shows a warning when the value is adjusted to stay within valid range.
 */
export function PercentageInput({
  id,
  label,
  value,
  error,
  helpText,
  allowOver100 = false,
  wasClamped: externalWasClamped,
  onChange,
}: PercentageInputProps) {
  const defaultValue = (PERCENTAGES as Record<string, number>)[id] ?? 0;
  const [localWasClamped, setLocalWasClamped] = useState(false);

  const handleChange = useCallback((e: Event) => {
    const inputValue = (e.target as HTMLInputElement).value;
    const parsed = parseFloat(inputValue);

    if (Number.isNaN(parsed)) {
      onChange(defaultValue);
      setLocalWasClamped(false);
      return;
    }

    const { clamped, wasClamped } = clampPercentage(parsed, allowOver100);
    setLocalWasClamped(wasClamped);
    onChange(clamped);
  }, [allowOver100, defaultValue, onChange]);

  const showClampedWarning = externalWasClamped ?? localWasClamped;
  const maxDisplay = allowOver100 ? '' : ' (max 100%)';

  return (
    <div class="input-group">
      <label for={`${id}-percent`}>{label}</label>
      <input
        type="number"
        id={`${id}-percent`}
        min="0"
        max={allowOver100 ? undefined : 100}
        step="0.1"
        value={value}
        onChange={handleChange}
        aria-describedby={
          error ? `${id}-error` :
          showClampedWarning ? `${id}-clamped` :
          helpText ? `${id}-help` : undefined
        }
        aria-invalid={error ? "true" : "false"}
        class={error ? "input-error" : showClampedWarning ? "input-warning" : ""}
      />
      {error ? (
        <small id={`${id}-error`} style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
          {error}
        </small>
      ) : showClampedWarning ? (
        <small id={`${id}-clamped`} style="color: #f39c12; font-size: 0.875rem; display: block; margin-top: 4px;" role="status">
          Value adjusted to valid range{maxDisplay}
        </small>
      ) : helpText ? (
        <small id={`${id}-help`} style="color: #7f8c8d; font-size: 0.875rem;">
          {helpText}
        </small>
      ) : null}
    </div>
  );
}

interface PercentageInputsGroupProps {
  service: number;
  tax: number;
  gratuity: number;
  contingency: number;
  serviceError?: string | null;
  taxError?: string | null;
  gratuityError?: string | null;
  contingencyError?: string | null;
  onServiceChange: (value: number) => void;
  onTaxChange: (value: number) => void;
  onGratuityChange: (value: number) => void;
  onContingencyChange: (value: number) => void;
}

/**
 * Group of percentage input fields for service fee, tax, gratuity, and contingency.
 */
export function PercentageInputsGroup({
  service,
  tax,
  gratuity,
  contingency,
  serviceError,
  taxError,
  gratuityError,
  contingencyError,
  onServiceChange,
  onTaxChange,
  onGratuityChange,
  onContingencyChange,
}: PercentageInputsGroupProps) {
  return (
    <>
      <PercentageInput
        id="service"
        label="Service Fee (%)"
        value={service}
        error={serviceError}
        onChange={onServiceChange}
      />
      <PercentageInput
        id="tax"
        label="Tax (%)"
        value={tax}
        error={taxError}
        onChange={onTaxChange}
      />
      <PercentageInput
        id="gratuity"
        label="Gratuity (%)"
        value={gratuity}
        error={gratuityError}
        onChange={onGratuityChange}
      />
      <PercentageInput
        id="contingency"
        label="Contingency Buffer (%)"
        value={contingency}
        error={contingencyError}
        helpText="Added buffer for unexpected costs (can exceed 100%)"
        allowOver100={true}
        onChange={onContingencyChange}
      />
    </>
  );
}
