import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CurrencyCell } from './CurrencyCell';

interface CategoryRowProps {
  name: string;
  isIncluded?: boolean;
  amounts: Array<{ value: number; label: string }>;
}

/**
 * Renders a single category row in the results table.
 * Shows the category name with optional "Included" marker and amounts for each venue.
 */
export function CategoryRow({ name, isIncluded, amounts }: CategoryRowProps) {
  return (
    <tr>
      <td class="category-name" data-label="Category">
        {name}
        {isIncluded && (
          <span class="included-marker" title="Included at our venues">
            ✓ Included
          </span>
        )}
      </td>
      {amounts.map((amount, idx) => (
        <CurrencyCell key={idx} amount={amount.value} label={amount.label} />
      ))}
    </tr>
  );
}

interface SectionHeaderRowProps {
  label: string;
  colSpan: number;
}

/**
 * Renders a section header row that spans all columns.
 */
export function SectionHeaderRow({ label, colSpan }: SectionHeaderRowProps) {
  return (
    <tr class="section-header">
      <td colSpan={colSpan} data-label="">
        <strong>{label}</strong>
      </td>
    </tr>
  );
}

interface FeeRowProps {
  label: string;
  amounts: Array<{ value: number; venueLabel: string }>;
}

/**
 * Renders a fee row (service, tax, gratuity, contingency).
 */
export function FeeRow({ label, amounts }: FeeRowProps) {
  return (
    <tr>
      <td class="category-name" data-label="Category">{label}</td>
      {amounts.map((amount, idx) => (
        <CurrencyCell key={idx} amount={amount.value} label={amount.venueLabel} />
      ))}
    </tr>
  );
}

interface TotalRowProps {
  label: string;
  amounts: Array<{ value: number; venueLabel: string }>;
  isPerGuest?: boolean;
}

/**
 * Renders a total row with bold styling.
 */
export function TotalRow({ label, amounts, isPerGuest }: TotalRowProps) {
  return (
    <tr class="total-row">
      <td data-label="">
        <strong>{label}</strong>
      </td>
      {amounts.map((amount, idx) => (
        <td key={idx} class="amount" data-label={amount.venueLabel}>
          ${isPerGuest ? amount.value.toFixed(2) : amount.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
      ))}
    </tr>
  );
}
