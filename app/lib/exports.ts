import { CalculationResult } from './calc';
import { logger } from './logger';

/**
 * Generate CSV export for single venue view
 */
export function generateCSVSingle(
  venueName: string,
  result: CalculationResult,
  guests: number
): string {
  logger.debug('Generating CSV for single venue view');
  
  const lines: string[] = [];
  
  // Header
  lines.push('Wedding Cost Estimate');
  lines.push(`Venue: ${venueName}`);
  lines.push(`Guest Count: ${guests}`);
  lines.push('');
  lines.push('Category,Amount,Per Guest');
  
  // Line items
  result.lineItems.forEach(item => {
    const perGuestStr = item.perGuest ? `$${item.perGuest.toFixed(2)}` : '';
    const includedNote = item.isIncluded ? ' (Included)' : '';
    lines.push(`"${item.name}${includedNote}",$${item.amount.toFixed(2)},${perGuestStr}`);
  });
  
  // Venue fee
  lines.push(`Venue Fee,$${result.venueFee.toFixed(2)},`);
  lines.push('');
  
  // Fees
  lines.push(`Service,$${result.service.toFixed(2)},`);
  lines.push(`Tax,$${result.tax.toFixed(2)},`);
  lines.push(`Gratuity,$${result.gratuity.toFixed(2)},`);
  lines.push(`Contingency,$${result.contingency.toFixed(2)},`);
  lines.push('');
  
  // Total
  lines.push(`TOTAL,$${result.total.toFixed(2)},$${result.perGuest.toFixed(2)}`);
  
  return lines.join('\n');
}

/**
 * Generate CSV export for comparison view
 */
export function generateCSVComparison(
  ourVenueName: string,
  ourResult: CalculationResult,
  otherResult: CalculationResult,
  guests: number
): string {
  logger.debug('Generating CSV for comparison view');
  
  const lines: string[] = [];
  
  // Header
  lines.push('Wedding Cost Estimate - Comparison');
  lines.push(`Our Venue: ${ourVenueName}`);
  lines.push(`Guest Count: ${guests}`);
  lines.push('');
  lines.push(`Category,${ourVenueName},Other Venue,Difference (Other - Ours)`);
  
  // Match line items by stable id
  const allCategories = new Map<string, string>();
  ourResult.lineItems.forEach(item => allCategories.set(item.id, item.name));
  otherResult.lineItems.forEach(item => allCategories.set(item.id, item.name));

  allCategories.forEach((label, categoryId) => {
    const ourItem = ourResult.lineItems.find(i => i.id === categoryId);
    const otherItem = otherResult.lineItems.find(i => i.id === categoryId);

    const ourAmount = ourItem?.amount ?? 0;
    const otherAmount = otherItem?.amount ?? 0;
    const diff = otherAmount - ourAmount;

    const includedNote = ourItem?.isIncluded ? ' (Included at our venue)' : '';
    const categoryName = ourItem?.name || otherItem?.name || label;
    lines.push(`"${categoryName}${includedNote}",$${ourAmount.toFixed(2)},$${otherAmount.toFixed(2)},$${diff.toFixed(2)}`);
  });
  
  // Venue fees
  const venueDiff = otherResult.venueFee - ourResult.venueFee;
  lines.push(`Venue Fee,$${ourResult.venueFee.toFixed(2)},$${otherResult.venueFee.toFixed(2)},$${venueDiff.toFixed(2)}`);
  lines.push('');
  
  // Fees
  const serviceDiff = otherResult.service - ourResult.service;
  const taxDiff = otherResult.tax - ourResult.tax;
  const gratuityDiff = otherResult.gratuity - ourResult.gratuity;
  const contingencyDiff = otherResult.contingency - ourResult.contingency;
  
  lines.push(`Service,$${ourResult.service.toFixed(2)},$${otherResult.service.toFixed(2)},$${serviceDiff.toFixed(2)}`);
  lines.push(`Tax,$${ourResult.tax.toFixed(2)},$${otherResult.tax.toFixed(2)},$${taxDiff.toFixed(2)}`);
  lines.push(`Gratuity,$${ourResult.gratuity.toFixed(2)},$${otherResult.gratuity.toFixed(2)},$${gratuityDiff.toFixed(2)}`);
  lines.push(`Contingency,$${ourResult.contingency.toFixed(2)},$${otherResult.contingency.toFixed(2)},$${contingencyDiff.toFixed(2)}`);
  lines.push('');
  
  // Totals
  const totalDiff = otherResult.total - ourResult.total;
  lines.push(`TOTAL,$${ourResult.total.toFixed(2)},$${otherResult.total.toFixed(2)},$${totalDiff.toFixed(2)}`);
  lines.push(`Per Guest,$${ourResult.perGuest.toFixed(2)},$${otherResult.perGuest.toFixed(2)},$${(totalDiff / guests).toFixed(2)}`);
  
  return lines.join('\n');
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
  logger.debug(`Downloading CSV: ${filename}`);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

