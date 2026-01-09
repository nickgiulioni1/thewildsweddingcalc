import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CalculationResult } from '../lib/calc';
import { VenueHeader } from './results/VenueHeader';
import { CategoryRow, SectionHeaderRow, FeeRow, TotalRow } from './results/CategoryRow';

/** Venue configuration for display */
interface VenueConfig {
  name: string;
  url?: string;
  result: CalculationResult;
}

interface ResultsTableProps {
  wildsResult: CalculationResult;
  lauralResult: CalculationResult;
  otherResult: CalculationResult | null;
  guests: number;
  compareMode: boolean;
}

/**
 * Main results table component that displays cost breakdowns for venues.
 * Renders either 2 venues (our venues) or 3 venues (with comparison).
 */
export function ResultsTable({ wildsResult, lauralResult, otherResult, compareMode }: ResultsTableProps) {
  const venues: VenueConfig[] = [
    { name: 'The Wilds', url: 'https://thewildsvenue.com/', result: wildsResult },
    { name: 'Laural Mill', url: 'https://lauralmill.com/', result: lauralResult },
  ];

  if (compareMode && otherResult) {
    venues.push({ name: 'Other Venue', result: otherResult });
  }

  return <VenueComparisonTable venues={venues} />;
}

interface VenueComparisonTableProps {
  venues: VenueConfig[];
}

/**
 * Renders a comparison table for the given venues.
 * Combines line items from all venues and displays them in a unified table.
 */
function VenueComparisonTable({ venues }: VenueComparisonTableProps) {
  // Combine all category names and create Maps for O(1) lookups
  const allCategories = new Map<string, string>();
  const venueMaps = venues.map(() => new Map<string, typeof venues[0]['result']['lineItems'][0]>());

  venues.forEach((venue, venueIdx) => {
    venue.result.lineItems.forEach(item => {
      allCategories.set(item.id, item.name);
      venueMaps[venueIdx].set(item.id, item);
    });
  });

  const colSpan = venues.length + 1;
  const showGratuity = venues.some(v => v.result.gratuity > 0);

  return (
    <div class="results-section">
      <h2>{venues.length > 2 ? 'Cost Comparison' : 'Cost Breakdown'}</h2>
      <table
        class="results-table"
        role="table"
        aria-label={
          venues.length > 2
            ? 'Side-by-side cost comparison of The Wilds, Laural Mill, and Other Venue'
            : 'Detailed cost breakdown for The Wilds and Laural Mill venues'
        }
      >
        <thead>
          <tr>
            <th>Category</th>
            {venues.map((venue, idx) => (
              <VenueHeader key={idx} name={venue.name} url={venue.url} />
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Line items */}
          {Array.from(allCategories.entries()).map(([categoryId, label]) => {
            const items = venueMaps.map(map => map.get(categoryId));
            const displayName = items.find(item => item?.name)?.name || label;
            const isIncluded = items[0]?.isIncluded;

            return (
              <CategoryRow
                key={categoryId}
                name={displayName}
                isIncluded={isIncluded}
                amounts={venues.map((venue, idx) => ({
                  value: items[idx]?.amount ?? 0,
                  label: venue.name,
                }))}
              />
            );
          })}

          {/* Taxes & Fees section */}
          <SectionHeaderRow label="Taxes & Fees" colSpan={colSpan} />

          <FeeRow
            label="Service Fee"
            amounts={venues.map(v => ({ value: v.result.service, venueLabel: v.name }))}
          />

          <FeeRow
            label="Tax"
            amounts={venues.map(v => ({ value: v.result.tax, venueLabel: v.name }))}
          />

          {showGratuity && (
            <FeeRow
              label="Gratuity"
              amounts={venues.map(v => ({ value: v.result.gratuity, venueLabel: v.name }))}
            />
          )}

          <FeeRow
            label="Contingency Buffer"
            amounts={venues.map(v => ({ value: v.result.contingency, venueLabel: v.name }))}
          />

          {/* Totals */}
          <TotalRow
            label="TOTAL ESTIMATE"
            amounts={venues.map(v => ({ value: v.result.total, venueLabel: v.name }))}
          />

          <TotalRow
            label="Per Guest"
            amounts={venues.map(v => ({ value: v.result.perGuest, venueLabel: v.name }))}
            isPerGuest={true}
          />
        </tbody>
      </table>
    </div>
  );
}
