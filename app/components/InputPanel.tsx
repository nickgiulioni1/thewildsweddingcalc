import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { MealStyle, BarService } from '../../config/config';
import { getDefaultFoodCost } from '../lib/defaults';
import { OverridesPanel } from './OverridesPanel';
import { OtherVenueOverridesPanel } from './OtherVenueOverridesPanel';
import {
  DateInput,
  GuestInput,
  MealStyleSelect,
  BarDurationSelect,
  BarServiceSelect,
  PercentageInputsGroup,
  CheckboxOption,
} from './inputs';

interface InputPanelProps {
  date: string;
  guests: number;
  mealStyle: MealStyle;
  barService: BarService;
  barDuration: number;
  compareMode: boolean;
  plannerUsed: boolean;
  service: number;
  tax: number;
  gratuity: number;
  contingency: number;
  dateError?: string | null;
  guestsError?: string | null;
  guestsClamped?: boolean;
  serviceError?: string | null;
  taxError?: string | null;
  gratuityError?: string | null;
  contingencyError?: string | null;
  onDateChange: (date: string) => void;
  onGuestsChange: (guests: number) => void;
  onMealStyleChange: (style: MealStyle) => void;
  onBarServiceChange: (service: BarService) => void;
  onBarDurationChange: (duration: number) => void;
  onCompareModeChange: (enabled: boolean) => void;
  onPlannerUsedChange: (used: boolean) => void;
  onServiceChange: (percent: number) => void;
  onTaxChange: (percent: number) => void;
  onGratuityChange: (percent: number) => void;
  onContingencyChange: (percent: number) => void;
  overrides: Record<string, number>;
  onOverrideChange: (category: string, value: number) => void;
  onResetOverrides: () => void;
  otherVenueOverrides: Record<string, number>;
  onOtherVenueOverrideChange: (category: string, value: number) => void;
  onResetOtherVenueOverrides: () => void;
}

/**
 * Main input panel component for the wedding cost calculator.
 * Contains all user inputs for configuring the wedding estimate.
 */
export function InputPanel(props: InputPanelProps) {
  return (
    <div class="input-panel">
      <h2>Wedding Details</h2>

      <div class="input-grid">
        <DateInput
          value={props.date}
          error={props.dateError}
          onChange={props.onDateChange}
        />

        <GuestInput
          value={props.guests}
          error={props.guestsError}
          clamped={props.guestsClamped}
          onChange={props.onGuestsChange}
        />

        <MealStyleSelect
          value={props.mealStyle}
          onChange={props.onMealStyleChange}
        />

        <BarDurationSelect
          value={props.barDuration}
          onChange={props.onBarDurationChange}
        />

        <BarServiceSelect
          value={props.barService}
          barDuration={props.barDuration}
          onChange={props.onBarServiceChange}
        />

        <CheckboxOption
          id="planner-used"
          checked={props.plannerUsed}
          onChange={props.onPlannerUsedChange}
        >
          External Planner/Coordinator
          <small style="color: #7f8c8d; font-size: 0.875rem; font-weight: normal; margin-top: 4px;">
            Our venues include planning & day-of coordination. Check this if using an external planner.
          </small>
        </CheckboxOption>

        <CheckboxOption
          id="compare-mode"
          checked={props.compareMode}
          onChange={props.onCompareModeChange}
        >
          Compare with a typical Other Venue
          <small style="color: #7f8c8d; font-size: 0.875rem; font-weight: normal; margin-top: 4px;">
            See side-by-side comparison with venues that don't include planning, setup, etc.
          </small>
        </CheckboxOption>
      </div>

      <OverridesPanel
        overrides={props.overrides}
        onOverrideChange={props.onOverrideChange}
        onResetOverrides={props.onResetOverrides}
        calculatedFoodCost={getDefaultFoodCost(props.guests, props.mealStyle)}
      />

      <AdvancedSettings
        service={props.service}
        tax={props.tax}
        gratuity={props.gratuity}
        contingency={props.contingency}
        serviceError={props.serviceError}
        taxError={props.taxError}
        gratuityError={props.gratuityError}
        contingencyError={props.contingencyError}
        onServiceChange={props.onServiceChange}
        onTaxChange={props.onTaxChange}
        onGratuityChange={props.onGratuityChange}
        onContingencyChange={props.onContingencyChange}
        compareMode={props.compareMode}
        otherVenueOverrides={props.otherVenueOverrides}
        onOtherVenueOverrideChange={props.onOtherVenueOverrideChange}
        onResetOtherVenueOverrides={props.onResetOtherVenueOverrides}
        currentVenueBarService={props.barService}
        currentVenueBarDuration={props.barDuration}
      />
    </div>
  );
}

interface AdvancedSettingsProps {
  service: number;
  tax: number;
  gratuity: number;
  contingency: number;
  serviceError?: string | null;
  taxError?: string | null;
  gratuityError?: string | null;
  contingencyError?: string | null;
  onServiceChange: (percent: number) => void;
  onTaxChange: (percent: number) => void;
  onGratuityChange: (percent: number) => void;
  onContingencyChange: (percent: number) => void;
  compareMode: boolean;
  otherVenueOverrides: Record<string, number>;
  onOtherVenueOverrideChange: (category: string, value: number) => void;
  onResetOtherVenueOverrides: () => void;
  currentVenueBarService: BarService;
  currentVenueBarDuration: number;
}

/**
 * Advanced settings accordion containing percentage inputs and other venue overrides.
 */
function AdvancedSettings(props: AdvancedSettingsProps) {
  return (
    <details class="accordion" style="margin-top: 20px;">
      <summary class="accordion-header" aria-controls="advanced-settings-content">
        <span>Advanced Settings (Percentages)</span>
      </summary>
      <div id="advanced-settings-content" class="accordion-content">
        <PercentageInputsGroup
          service={props.service}
          tax={props.tax}
          gratuity={props.gratuity}
          contingency={props.contingency}
          serviceError={props.serviceError}
          taxError={props.taxError}
          gratuityError={props.gratuityError}
          contingencyError={props.contingencyError}
          onServiceChange={props.onServiceChange}
          onTaxChange={props.onTaxChange}
          onGratuityChange={props.onGratuityChange}
          onContingencyChange={props.onContingencyChange}
        />

        {props.compareMode && (
          <OtherVenueOverridesPanel
            overrides={props.otherVenueOverrides}
            onOverrideChange={props.onOtherVenueOverrideChange}
            onResetOverrides={props.onResetOtherVenueOverrides}
            currentVenueBarService={props.currentVenueBarService}
            currentVenueBarDuration={props.currentVenueBarDuration}
            inline={true}
          />
        )}
      </div>
    </details>
  );
}
