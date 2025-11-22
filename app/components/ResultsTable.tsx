import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CalculationResult } from '../lib/calc';

interface ResultsTableProps {
  wildsResult: CalculationResult;
  lauralResult: CalculationResult;
  otherResult: CalculationResult | null;
  guests: number;
  compareMode: boolean;
}

export function ResultsTable({ wildsResult, lauralResult, otherResult, guests, compareMode }: ResultsTableProps) {
  // ResultsTable rendered - removed console.log per logger utility

  if (!compareMode) {
    return renderTwoVenues(wildsResult, lauralResult, guests);
  }

  if (!otherResult) {
    return renderTwoVenues(wildsResult, lauralResult, guests);
  }

  return renderThreeVenues(wildsResult, lauralResult, otherResult, guests);
}

function renderTwoVenues(wildsResult: CalculationResult, lauralResult: CalculationResult, _guests: number) {
  // Combine all category names and create Maps for O(1) lookups
  const allCategories = new Set<string>();
  const wildsMap = new Map<string, typeof wildsResult.lineItems[0]>();
  const lauralMap = new Map<string, typeof lauralResult.lineItems[0]>();
  
  wildsResult.lineItems.forEach(item => {
    allCategories.add(item.name);
    wildsMap.set(item.name, item);
  });
  lauralResult.lineItems.forEach(item => {
    allCategories.add(item.name);
    lauralMap.set(item.name, item);
  });

  return (
    <div class="results-section">
      <h2>Cost Breakdown</h2>
      <table class="results-table" role="table" aria-label="Detailed cost breakdown for The Wilds and Laural Mill venues">
        <thead>
          <tr>
            <th>Category</th>
            <th class="amount">
              <a href="https://thewildsvenue.com/" target="_blank" rel="noopener noreferrer" class="venue-link-header">
                The Wilds
              </a>
            </th>
            <th class="amount">
              <a href="https://lauralmill.com/" target="_blank" rel="noopener noreferrer" class="venue-link-header">
                Laural Mill
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from(allCategories).map((category, idx) => {
            const wildsItem = wildsMap.get(category);
            const lauralItem = lauralMap.get(category);
            
            const wildsAmount = wildsItem?.amount ?? 0;
            const lauralAmount = lauralItem?.amount ?? 0;
            
            return (
              <tr key={idx}>
                <td class="category-name" data-label="Category">
                  {category}
                  {wildsItem?.isIncluded && (
                    <span class="included-marker" title="Included at our venues">
                      ✓ Included
                    </span>
                  )}
                </td>
                <td class="amount" data-label="The Wilds">${wildsAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="amount" data-label="Laural Mill">${lauralAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
          
          <tr class="section-header">
            <td colSpan={3} data-label=""><strong>Taxes & Fees</strong></td>
          </tr>
          
          <tr>
            <td class="category-name" data-label="Category">Service Fee</td>
            <td class="amount" data-label="The Wilds">${wildsResult.service.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.service.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr>
            <td class="category-name" data-label="Category">Tax</td>
            <td class="amount" data-label="The Wilds">${wildsResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          {(wildsResult.gratuity > 0 || lauralResult.gratuity > 0) && (
            <tr>
              <td class="category-name" data-label="Category">Gratuity</td>
              <td class="amount" data-label="The Wilds">${wildsResult.gratuity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="amount" data-label="Laural Mill">${lauralResult.gratuity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          
          <tr>
            <td class="category-name" data-label="Category">Contingency Buffer</td>
            <td class="amount" data-label="The Wilds">${wildsResult.contingency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.contingency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr class="total-row">
            <td data-label=""><strong>TOTAL ESTIMATE</strong></td>
            <td class="amount" data-label="The Wilds">${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr class="total-row">
            <td data-label=""><strong>Per Guest</strong></td>
            <td class="amount" data-label="The Wilds">${wildsResult.perGuest.toFixed(2)}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.perGuest.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function renderThreeVenues(wildsResult: CalculationResult, lauralResult: CalculationResult, otherResult: CalculationResult, _guests: number) {
  // Combine all category names and create Maps for O(1) lookups
  const allCategories = new Set<string>();
  const wildsMap = new Map<string, typeof wildsResult.lineItems[0]>();
  const lauralMap = new Map<string, typeof lauralResult.lineItems[0]>();
  const otherMap = new Map<string, typeof otherResult.lineItems[0]>();
  
  wildsResult.lineItems.forEach(item => {
    allCategories.add(item.name);
    wildsMap.set(item.name, item);
  });
  lauralResult.lineItems.forEach(item => {
    allCategories.add(item.name);
    lauralMap.set(item.name, item);
  });
  otherResult.lineItems.forEach(item => {
    allCategories.add(item.name);
    otherMap.set(item.name, item);
  });

  return (
    <div class="results-section">
      <h2>Cost Comparison</h2>
      <table class="results-table" role="table" aria-label="Side-by-side cost comparison of The Wilds, Laural Mill, and Other Venue">
        <thead>
          <tr>
            <th>Category</th>
            <th class="amount">
              <a href="https://thewildsvenue.com/" target="_blank" rel="noopener noreferrer" class="venue-link-header">
                The Wilds
              </a>
            </th>
            <th class="amount">
              <a href="https://lauralmill.com/" target="_blank" rel="noopener noreferrer" class="venue-link-header">
                Laural Mill
              </a>
            </th>
            <th class="amount">Other Venue</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(allCategories).map((category, idx) => {
            const wildsItem = wildsMap.get(category);
            const lauralItem = lauralMap.get(category);
            const otherItem = otherMap.get(category);
            
            const wildsAmount = wildsItem?.amount ?? 0;
            const lauralAmount = lauralItem?.amount ?? 0;
            const otherAmount = otherItem?.amount ?? 0;
            
            return (
              <tr key={idx}>
                <td class="category-name" data-label="Category">
                  {category}
                  {wildsItem?.isIncluded && (
                    <span class="included-marker" title="Included at our venues">
                      ✓ Included
                    </span>
                  )}
                </td>
                <td class="amount" data-label="The Wilds">${wildsAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="amount" data-label="Laural Mill">${lauralAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="amount" data-label="Other Venue">${otherAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
          
          <tr class="section-header">
            <td colSpan={4} data-label=""><strong>Taxes & Fees</strong></td>
          </tr>
          
          <tr>
            <td class="category-name" data-label="Category">Service Fee</td>
            <td class="amount" data-label="The Wilds">${wildsResult.service.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.service.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Other Venue">${otherResult.service.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr>
            <td class="category-name" data-label="Category">Tax</td>
            <td class="amount" data-label="The Wilds">${wildsResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Other Venue">${otherResult.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          {(wildsResult.gratuity > 0 || lauralResult.gratuity > 0 || otherResult.gratuity > 0) && (
            <tr>
              <td class="category-name" data-label="Category">Gratuity</td>
              <td class="amount" data-label="The Wilds">${wildsResult.gratuity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="amount" data-label="Laural Mill">${lauralResult.gratuity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="amount" data-label="Other Venue">${otherResult.gratuity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          
          <tr>
            <td class="category-name" data-label="Category">Contingency Buffer</td>
            <td class="amount" data-label="The Wilds">${wildsResult.contingency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.contingency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Other Venue">${otherResult.contingency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr class="total-row">
            <td data-label=""><strong>TOTAL ESTIMATE</strong></td>
            <td class="amount" data-label="The Wilds">${wildsResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="amount" data-label="Other Venue">${otherResult.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          
          <tr class="total-row">
            <td data-label=""><strong>Per Guest</strong></td>
            <td class="amount" data-label="The Wilds">${wildsResult.perGuest.toFixed(2)}</td>
            <td class="amount" data-label="Laural Mill">${lauralResult.perGuest.toFixed(2)}</td>
            <td class="amount" data-label="Other Venue">${otherResult.perGuest.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
