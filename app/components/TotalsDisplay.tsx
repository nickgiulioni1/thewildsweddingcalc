import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CalculationResult } from '../lib/calc';

interface TotalsDisplayProps {
  wildsResult: CalculationResult;
  lauralResult: CalculationResult;
  otherResult: CalculationResult | null;
  compareMode: boolean;
}

export function TotalsDisplay({ wildsResult, lauralResult, otherResult, compareMode }: TotalsDisplayProps) {
  // TotalsDisplay rendered - removed console.log per logger utility

  if (!compareMode) {
    return (
      <div class="comparison-totals" role="region" aria-live="polite" aria-label="Venue cost estimates">
        <div class="total-card">
          <h4>
            <a href="https://thewildsvenue.com/" target="_blank" rel="noopener noreferrer" class="venue-link">
              The Wilds
            </a>
          </h4>
          <div class="amount" aria-label={`The Wilds total estimate: $${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            ${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div class="per-guest" aria-label={`${wildsResult.perGuest.toFixed(2)} per guest`}>
            ${wildsResult.perGuest.toFixed(2)} per guest
          </div>
        </div>
        
        <div class="total-card">
          <h4>
            <a href="https://lauralmill.com/" target="_blank" rel="noopener noreferrer" class="venue-link">
              Laural Mill
            </a>
          </h4>
          <div class="amount" aria-label={`Laural Mill total estimate: $${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            ${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div class="per-guest" aria-label={`${lauralResult.perGuest.toFixed(2)} per guest`}>
            ${lauralResult.perGuest.toFixed(2)} per guest
          </div>
        </div>
      </div>
    );
  }

  // Three-column comparison with Other Venue
  if (!otherResult) return null;

  return (
    <div role="region" aria-live="polite" aria-label="Cost comparison totals">
      <div class="comparison-totals">
        <div class="total-card">
          <h4>
            <a href="https://thewildsvenue.com/" target="_blank" rel="noopener noreferrer" class="venue-link">
              The Wilds
            </a>
          </h4>
          <div class="amount" aria-label={`The Wilds total estimate: $${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            ${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div class="per-guest" aria-label={`${wildsResult.perGuest.toFixed(2)} per guest`}>
            ${wildsResult.perGuest.toFixed(2)} per guest
          </div>
        </div>
        
        <div class="total-card">
          <h4>
            <a href="https://lauralmill.com/" target="_blank" rel="noopener noreferrer" class="venue-link">
              Laural Mill
            </a>
          </h4>
          <div class="amount" aria-label={`Laural Mill total estimate: $${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            ${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div class="per-guest" aria-label={`${lauralResult.perGuest.toFixed(2)} per guest`}>
            ${lauralResult.perGuest.toFixed(2)} per guest
          </div>
        </div>
        
        <div class="total-card">
          <h4>Other Venue</h4>
          <div class="amount" style="color: #c62828;" aria-label={`Other venue total estimate: $${otherResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, higher than our venues`}>
            ${otherResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div class="per-guest" aria-label={`${otherResult.perGuest.toFixed(2)} per guest`}>
            ${otherResult.perGuest.toFixed(2)} per guest
          </div>
        </div>
      </div>
    </div>
  );
}
