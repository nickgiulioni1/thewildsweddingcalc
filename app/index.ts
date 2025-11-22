import { h, render } from 'preact';
import { WeddingCostEstimatorWidget } from './widget';
import { logger } from './lib/logger';

logger.info('Wedding Cost Estimator Widget initializing...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  logger.debug('Initializing widget');
  
  const container = document.getElementById('wedding-cost-estimator');
  
  if (!container) {
    logger.error('Wedding Cost Estimator: Container element with id "wedding-cost-estimator" not found');
    return;
  }

  logger.debug('Container found, rendering widget');
  render(h(WeddingCostEstimatorWidget, {}), container);
  logger.info('Widget rendered successfully');
}

// Export for use in other contexts if needed
export { WeddingCostEstimatorWidget };

