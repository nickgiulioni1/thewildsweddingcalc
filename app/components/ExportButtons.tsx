import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { CalculationResult } from '../lib/calc';
import { downloadCSV } from '../lib/exports';
import { logger } from '../lib/logger';

interface ExportButtonsProps {
  wildsResult: CalculationResult;
  lauralResult: CalculationResult;
  otherResult: CalculationResult | null;
  guests: number;
  compareMode: boolean;
  onShowDisclaimer: () => void;
}

export function ExportButtons({
  wildsResult,
  lauralResult,
  otherResult,
  guests,
  compareMode,
  onShowDisclaimer,
}: ExportButtonsProps) {
  // ExportButtons rendered - removed console.log per logger utility

  const handleCSVExport = () => {
    logger.debug('Exporting CSV');
    let csv: string;
    let filename: string;

    if (compareMode && otherResult) {
      csv = generateThreeVenueCSV(wildsResult, lauralResult, otherResult, guests);
      filename = `wedding-cost-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csv = generateTwoVenueCSV(wildsResult, lauralResult, guests);
      filename = `wedding-cost-estimate-${new Date().toISOString().split('T')[0]}.csv`;
    }

    downloadCSV(filename, csv);
  };

  const handlePrint = () => {
    logger.debug('Opening print dialog');
    window.print();
  };

  return (
    <div class="export-buttons">
      <button class="btn btn-primary" onClick={handleCSVExport} aria-label="Export estimate as CSV file">
        📊 Export CSV
      </button>
      <button class="btn btn-secondary" onClick={handlePrint} aria-label="Print estimate">
        🖨️ Print / Save PDF
      </button>
      <button class="btn btn-info" onClick={onShowDisclaimer} aria-label="View assumptions and disclaimer">
        ℹ️ Assumptions & Disclaimer
      </button>
    </div>
  );
}

function generateTwoVenueCSV(wildsResult: CalculationResult, lauralResult: CalculationResult, guests: number): string {
  const lines: string[] = [];
  
  lines.push('Wedding Cost Estimate');
  lines.push(`Guest Count: ${guests}`);
  lines.push('');
  lines.push('Category,The Wilds,Laural Mill');
  
  // Line items
  const allCategories = new Set<string>();
  wildsResult.lineItems.forEach(item => allCategories.add(item.name));
  lauralResult.lineItems.forEach(item => allCategories.add(item.name));
  
  allCategories.forEach(category => {
    const wildsItem = wildsResult.lineItems.find(i => i.name === category);
    const lauralItem = lauralResult.lineItems.find(i => i.name === category);
    
    const wildsAmount = wildsItem?.amount ?? 0;
    const lauralAmount = lauralItem?.amount ?? 0;
    
    const includedNote = wildsItem?.isIncluded ? ' (Included)' : '';
    lines.push(`"${category}${includedNote}",$${wildsAmount.toFixed(2)},$${lauralAmount.toFixed(2)}`);
  });
  
  lines.push('');
  lines.push(`Venue Fee,$${wildsResult.venueFee.toFixed(2)},$${lauralResult.venueFee.toFixed(2)}`);
  lines.push(`Service,$${wildsResult.service.toFixed(2)},$${lauralResult.service.toFixed(2)}`);
  lines.push(`Tax,$${wildsResult.tax.toFixed(2)},$${lauralResult.tax.toFixed(2)}`);
  lines.push(`Gratuity,$${wildsResult.gratuity.toFixed(2)},$${lauralResult.gratuity.toFixed(2)}`);
  lines.push(`Contingency,$${wildsResult.contingency.toFixed(2)},$${lauralResult.contingency.toFixed(2)}`);
  lines.push('');
  lines.push(`TOTAL,$${wildsResult.total.toFixed(2)},$${lauralResult.total.toFixed(2)}`);
  
  return lines.join('\n');
}

function generateThreeVenueCSV(wildsResult: CalculationResult, lauralResult: CalculationResult, otherResult: CalculationResult, guests: number): string {
  const lines: string[] = [];
  
  lines.push('Wedding Cost Estimate - Three Venue Comparison');
  lines.push(`Guest Count: ${guests}`);
  lines.push('');
  lines.push('Category,The Wilds,Laural Mill,Other Venue');
  
  // Line items
  const allCategories = new Set<string>();
  wildsResult.lineItems.forEach(item => allCategories.add(item.name));
  lauralResult.lineItems.forEach(item => allCategories.add(item.name));
  otherResult.lineItems.forEach(item => allCategories.add(item.name));
  
  allCategories.forEach(category => {
    const wildsItem = wildsResult.lineItems.find(i => i.name === category);
    const lauralItem = lauralResult.lineItems.find(i => i.name === category);
    const otherItem = otherResult.lineItems.find(i => i.name === category);
    
    const wildsAmount = wildsItem?.amount ?? 0;
    const lauralAmount = lauralItem?.amount ?? 0;
    const otherAmount = otherItem?.amount ?? 0;
    
    const includedNote = wildsItem?.isIncluded ? ' (Included at our venues)' : '';
    lines.push(`"${category}${includedNote}",$${wildsAmount.toFixed(2)},$${lauralAmount.toFixed(2)},$${otherAmount.toFixed(2)}`);
  });
  
  lines.push('');
  lines.push(`Venue Fee,$${wildsResult.venueFee.toFixed(2)},$${lauralResult.venueFee.toFixed(2)},$${otherResult.venueFee.toFixed(2)}`);
  lines.push(`Service,$${wildsResult.service.toFixed(2)},$${lauralResult.service.toFixed(2)},$${otherResult.service.toFixed(2)}`);
  lines.push(`Tax,$${wildsResult.tax.toFixed(2)},$${lauralResult.tax.toFixed(2)},$${otherResult.tax.toFixed(2)}`);
  lines.push(`Gratuity,$${wildsResult.gratuity.toFixed(2)},$${lauralResult.gratuity.toFixed(2)},$${otherResult.gratuity.toFixed(2)}`);
  lines.push(`Contingency,$${wildsResult.contingency.toFixed(2)},$${lauralResult.contingency.toFixed(2)},$${otherResult.contingency.toFixed(2)}`);
  lines.push('');
  lines.push(`TOTAL,$${wildsResult.total.toFixed(2)},$${lauralResult.total.toFixed(2)},$${otherResult.total.toFixed(2)}`);
  
  return lines.join('\n');
}
