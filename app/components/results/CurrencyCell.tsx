import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface CurrencyCellProps {
  amount: number;
  label: string;
}

/**
 * Formats and displays a currency value in a table cell.
 * Uses US locale formatting with 2 decimal places.
 */
export function CurrencyCell({ amount, label }: CurrencyCellProps) {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <td class="amount" data-label={label}>
      ${formatted}
    </td>
  );
}
