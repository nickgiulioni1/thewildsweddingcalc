import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState } from 'preact/hooks';
import { InputPanel } from './components/InputPanel';
import { ResultsTable } from './components/ResultsTable';
import { TotalsDisplay } from './components/TotalsDisplay';
import { ExportButtons } from './components/ExportButtons';
import { CallToAction } from './components/CallToAction';
import { DisclaimerModal } from './components/DisclaimerModal';
import { AboutModal } from './components/AboutModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logger } from './lib/logger';
import { useWeddingCalculator } from './hooks/useWeddingCalculator';
import { useValidationHandlers } from './hooks/useValidationHandlers';
import { useOverrideHandlers } from './hooks/useOverrideHandlers';
import './styles/widget.css';

export function WeddingCostEstimatorWidget() {
  logger.debug('WeddingCostEstimatorWidget mounted');
  
  // Modal state
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);

  // Use custom hooks for calculator logic
  const calculator = useWeddingCalculator();
  
  // Create setters for validation state
  const setValidationField = (field: keyof typeof calculator.validation, value: string | null | boolean) => {
    calculator.setValidation(prev => ({ ...prev, [field]: value }));
  };
  
  const validationHandlers = useValidationHandlers(
    {
      setDate: calculator.setDate,
      setGuests: calculator.setGuests,
      setService: calculator.setService,
      setTax: calculator.setTax,
      setGratuity: calculator.setGratuity,
      setContingency: calculator.setContingency,
    },
    {
      setDateError: (error) => setValidationField('dateError', error),
      setGuestsError: (error) => setValidationField('guestsError', error),
      setGuestsClamped: (clamped) => setValidationField('guestsClamped', clamped),
      setServiceError: (error) => setValidationField('serviceError', error),
      setTaxError: (error) => setValidationField('taxError', error),
      setGratuityError: (error) => setValidationField('gratuityError', error),
      setContingencyError: (error) => setValidationField('contingencyError', error),
    }
  );
  
  const overrideHandlers = useOverrideHandlers(
    calculator.setOverrides,
    calculator.setOtherVenueOverrides
  );

  return (
    <ErrorBoundary>
      <div class="wedding-estimator" role="main" aria-label="Wedding Cost Estimator">
        <div class="header-bar">
          <button class="btn-icon" onClick={() => setShowAbout(true)} aria-label="About this tool" aria-describedby="about-button-description">
            ℹ️ About
          </button>
          <span id="about-button-description" class="sr-only">Opens a dialog with information about this wedding cost estimation tool</span>
        </div>

        <InputPanel
        date={calculator.date}
        guests={calculator.guests}
        mealStyle={calculator.mealStyle}
        barService={calculator.barService}
        barDuration={calculator.barDuration}
        compareMode={calculator.compareMode}
        plannerUsed={calculator.plannerUsed}
        service={calculator.service}
        tax={calculator.tax}
        gratuity={calculator.gratuity}
        contingency={calculator.contingency}
        overrides={calculator.overrides}
        otherVenueOverrides={calculator.otherVenueOverrides}
        dateError={calculator.validation.dateError}
        guestsError={calculator.validation.guestsError}
        guestsClamped={calculator.validation.guestsClamped}
        serviceError={calculator.validation.serviceError}
        taxError={calculator.validation.taxError}
        gratuityError={calculator.validation.gratuityError}
        contingencyError={calculator.validation.contingencyError}
        onDateChange={validationHandlers.onDateChange}
        onGuestsChange={validationHandlers.onGuestsChange}
        onMealStyleChange={calculator.setMealStyle}
        onBarServiceChange={calculator.setBarService}
        onBarDurationChange={calculator.setBarDuration}
        onCompareModeChange={calculator.setCompareMode}
        onPlannerUsedChange={calculator.setPlannerUsed}
        onServiceChange={validationHandlers.onServiceChange}
        onTaxChange={validationHandlers.onTaxChange}
        onGratuityChange={validationHandlers.onGratuityChange}
        onContingencyChange={validationHandlers.onContingencyChange}
        onOverrideChange={overrideHandlers.onOverrideChange}
        onResetOverrides={overrideHandlers.onResetOverrides}
        onOtherVenueOverrideChange={overrideHandlers.onOtherVenueOverrideChange}
        onResetOtherVenueOverrides={overrideHandlers.onResetOtherVenueOverrides}
      />

      {calculator.wildsResult && calculator.lauralResult && (
        <>
          <TotalsDisplay
            wildsResult={calculator.wildsResult}
            lauralResult={calculator.lauralResult}
            otherResult={calculator.otherResult}
            compareMode={calculator.compareMode}
          />

          <ResultsTable
            wildsResult={calculator.wildsResult}
            lauralResult={calculator.lauralResult}
            otherResult={calculator.otherResult}
            guests={calculator.guests}
            compareMode={calculator.compareMode}
          />

          <ExportButtons
            wildsResult={calculator.wildsResult}
            lauralResult={calculator.lauralResult}
            otherResult={calculator.otherResult}
            guests={calculator.guests}
            compareMode={calculator.compareMode}
            onShowDisclaimer={() => setShowDisclaimer(true)}
          />

          <CallToAction
            wildsResult={calculator.wildsResult}
            lauralResult={calculator.lauralResult}
            otherResult={calculator.otherResult}
            guests={calculator.guests}
            compareMode={calculator.compareMode}
          />
        </>
      )}

      {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
      </div>
    </ErrorBoundary>
  );
}

