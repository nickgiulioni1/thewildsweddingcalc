import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState, useEffect } from 'preact/hooks';
import { MealStyle, BarService, GUESTS, BAR, PERCENTAGES } from '../../config/config';
import { getDefaultFoodCost } from '../lib/defaults';
import { OverridesPanel } from './OverridesPanel';
import { OtherVenueOverridesPanel } from './OtherVenueOverridesPanel';
import { Tooltip } from './Tooltip';

const parsePercentInput = (event: Event, defaultValue: number) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  return Number.isNaN(value) ? defaultValue : value;
};

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

export function InputPanel(props: InputPanelProps) {
  // InputPanel rendered - removed console.log per logger utility

  return (
    <div class="input-panel">
      <h2>Wedding Details</h2>
      
      <div class="input-grid">
        {/* Wedding Date */}
        <div class="input-group input-group-date">
        <label for="wedding-date">Wedding Date</label>
        <input
          type="date"
          id="wedding-date"
          value={props.date}
          onChange={(e) => props.onDateChange((e.target as HTMLInputElement).value)}
          aria-describedby={props.dateError ? "date-error date-help" : "date-help"}
          aria-invalid={props.dateError ? "true" : "false"}
          aria-required="true"
          class={props.dateError ? "input-error" : ""}
        />
        {props.dateError ? (
          <small id="date-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
            {props.dateError}
          </small>
        ) : (
          <small id="date-help" style="color: #7f8c8d; font-size: 0.875rem;">
            Pricing varies by day of week and season
          </small>
        )}
      </div>
      
      {/* Guest Count */}
      <div class="input-group">
        <label for="guest-count">Estimated Guest Count</label>
        <input
          type="number"
          id="guest-count"
          min={GUESTS.min}
          max={GUESTS.max}
          value={props.guests}
          onChange={(e) => props.onGuestsChange(parseInt((e.target as HTMLInputElement).value) || GUESTS.default)}
          aria-describedby={props.guestsError || props.guestsClamped ? "guests-error guests-help" : "guests-help"}
          aria-invalid={props.guestsError ? "true" : "false"}
          aria-required="true"
          class={props.guestsError ? "input-error" : ""}
        />
        {props.guestsError ? (
          <small id="guests-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
            {props.guestsError}
          </small>
        ) : props.guestsClamped ? (
          <small id="guests-error" style="color: #f39c12; font-size: 0.875rem; display: block; margin-top: 4px;" role="status">
            Guest count adjusted to valid range: {GUESTS.min}-{GUESTS.max}
          </small>
        ) : (
          <small id="guests-help" style="color: #7f8c8d; font-size: 0.875rem;">
            Valid range: {GUESTS.min}-{GUESTS.max} guests
          </small>
        )}
      </div>
      
      {/* Meal Style */}
      <div class="input-group">
        <label for="meal-style">
          Meal Style
          <Tooltip text="Different meal styles have different per-guest costs. Buffet is typically most affordable." />
        </label>
        <select
          id="meal-style"
          value={props.mealStyle}
          onChange={(e) => props.onMealStyleChange((e.target as HTMLSelectElement).value as MealStyle)}
          aria-describedby="meal-style-help"
          aria-required="true"
        >
          <option value="buffet">Buffet</option>
          <option value="family">Family Style (+$6/guest)</option>
          <option value="plated">Plated (+$12/guest)</option>
        </select>
        <small id="meal-style-help" style="color: #7f8c8d; font-size: 0.875rem; display: block; margin-top: 4px;">
          Select your preferred meal service style. Pricing varies by style.
        </small>
      </div>
      
      {/* Bar Duration */}
      <div class="input-group">
        <label for="bar-duration">
          Bar Duration (hours)
          <Tooltip text="Longer bar service increases both setup fee and per-guest costs." />
        </label>
        <select
          id="bar-duration"
          value={props.barDuration}
          onChange={(e) => props.onBarDurationChange(parseInt((e.target as HTMLSelectElement).value))}
        >
          {[1, 2, 3, 4, 5, 6].map(hours => (
            <option key={hours} value={hours}>
              {hours} hour{hours !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
      
      {/* Bar Service */}
      <div class="input-group input-group-bar-service">
        <label for="bar-service">Bar Service Type</label>
        {!props.compareMode ? (
          <select
            id="bar-service"
            value={props.barService}
            onChange={(e) => props.onBarServiceChange((e.target as HTMLSelectElement).value as BarService)}
            title={BAR.services.find(s => s.id === props.barService)?.label || ''}
          >
            {BAR.services.map(service => {
              const cost = service.id === 'cashBar' ? 'No charge' :
                `$${service.perGuestByHour?.[props.barDuration as keyof typeof service.perGuestByHour] || 0}/guest`;
              // Shorten labels for better fit
              const shortLabel = service.label
                .replace('Open Beer, Wine & Premium Spirits', 'Premium Spirits')
                .replace('Open Beer, Wine & Elite Spirits', 'Elite Spirits')
                .replace('Open Beer & Wine', 'Beer & Wine');
              return (
                <option key={service.id} value={service.id} title={`${service.label} (${cost})`}>
                  {shortLabel} ({cost})
                </option>
              );
            })}
          </select>
        ) : (
          <select
            id="bar-service"
            value={props.barService}
            onChange={(e) => props.onBarServiceChange((e.target as HTMLSelectElement).value as BarService)}
            aria-label="Bar service type (same for both venues)"
            title={BAR.services.find(s => s.id === props.barService)?.label || ''}
          >
            {BAR.services.map(service => {
              const cost = service.id === 'cashBar' ? 'No charge' :
                `$${service.perGuestByHour?.[props.barDuration as keyof typeof service.perGuestByHour] || 0}/guest`;
              // Shorten labels for better fit
              const shortLabel = service.label
                .replace('Open Beer, Wine & Premium Spirits', 'Premium Spirits')
                .replace('Open Beer, Wine & Elite Spirits', 'Elite Spirits')
                .replace('Open Beer & Wine', 'Beer & Wine');
              return (
                <option key={service.id} value={service.id} title={`${service.label} (${cost})`}>
                  {shortLabel} ({cost})
                </option>
              );
            })}
          </select>
        )}
      </div>
      
      {/* Planner */}
      <div class="input-group">
        <div class="checkbox-option">
          <input
            type="checkbox"
            id="planner-used"
            checked={props.plannerUsed}
            onChange={(e) => props.onPlannerUsedChange((e.target as HTMLInputElement).checked)}
          />
          <label for="planner-used">
            External Planner/Coordinator
            <small style="color: #7f8c8d; font-size: 0.875rem; font-weight: normal; margin-top: 4px;">
              Our venues include planning & day-of coordination. Check this if using an external planner.
            </small>
          </label>
        </div>
      </div>
      
      {/* Compare Mode Toggle */}
      <div class="input-group">
        <div class="checkbox-option">
          <input
            type="checkbox"
            id="compare-mode"
            checked={props.compareMode}
            onChange={(e) => props.onCompareModeChange((e.target as HTMLInputElement).checked)}
          />
          <label for="compare-mode">
            Compare with a typical Other Venue
            <small style="color: #7f8c8d; font-size: 0.875rem; font-weight: normal; margin-top: 4px;">
              See side-by-side comparison with venues that don't include planning, setup, etc.
            </small>
          </label>
        </div>
      </div>
      </div>
      
      {/* Customize Category Costs */}
      <OverridesPanel
        overrides={props.overrides}
        onOverrideChange={props.onOverrideChange}
        onResetOverrides={props.onResetOverrides}
        calculatedFoodCost={getDefaultFoodCost(props.guests, props.mealStyle)}
      />
      
      {/* Advanced Settings (Accordion) */}
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

function AdvancedSettings(props: AdvancedSettingsProps) {
  // Default to collapsed, but auto-open when compare mode is enabled
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open Advanced Settings when compare mode is enabled
  useEffect(() => {
    if (props.compareMode) {
      setIsOpen(true);
    }
  }, [props.compareMode]);

  return (
    <div class="accordion" style="margin-top: 20px;">
      <div
        class="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="advanced-settings-content"
      >
        <span>Advanced Settings (Percentages)</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div
        id="advanced-settings-content"
        class={`accordion-content ${!isOpen ? 'collapsed' : ''}`}
      >
        <div class="input-group">
          <label for="service-percent">Service Fee (%)</label>
          <input
            type="number"
            id="service-percent"
            min="0"
            max="100"
            step="0.1"
            value={props.service}
            onChange={(e) => props.onServiceChange(parsePercentInput(e, PERCENTAGES.service))}
            aria-describedby={props.serviceError ? "service-error" : undefined}
            aria-invalid={props.serviceError ? "true" : "false"}
            class={props.serviceError ? "input-error" : ""}
          />
          {props.serviceError && (
            <small id="service-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
              {props.serviceError}
            </small>
          )}
        </div>
        
        <div class="input-group">
          <label for="tax-percent">Tax (%)</label>
          <input
            type="number"
            id="tax-percent"
            min="0"
            max="100"
            step="0.1"
            value={props.tax}
            onChange={(e) => props.onTaxChange(parsePercentInput(e, PERCENTAGES.tax))}
            aria-describedby={props.taxError ? "tax-error" : undefined}
            aria-invalid={props.taxError ? "true" : "false"}
            class={props.taxError ? "input-error" : ""}
          />
          {props.taxError && (
            <small id="tax-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
              {props.taxError}
            </small>
          )}
        </div>
        
        <div class="input-group">
          <label for="gratuity-percent">Gratuity (%)</label>
          <input
            type="number"
            id="gratuity-percent"
            min="0"
            max="100"
            step="0.1"
            value={props.gratuity}
            onChange={(e) => props.onGratuityChange(parsePercentInput(e, PERCENTAGES.gratuity))}
            aria-describedby={props.gratuityError ? "gratuity-error" : undefined}
            aria-invalid={props.gratuityError ? "true" : "false"}
            class={props.gratuityError ? "input-error" : ""}
          />
          {props.gratuityError && (
            <small id="gratuity-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
              {props.gratuityError}
            </small>
          )}
        </div>
        
        <div class="input-group">
          <label for="contingency-percent">Contingency Buffer (%)</label>
          <input
            type="number"
            id="contingency-percent"
            min="0"
            step="0.1"
            value={props.contingency}
            onChange={(e) => props.onContingencyChange(parsePercentInput(e, PERCENTAGES.contingency))}
            aria-describedby={props.contingencyError ? "contingency-error" : "contingency-help"}
            aria-invalid={props.contingencyError ? "true" : "false"}
            class={props.contingencyError ? "input-error" : ""}
          />
          {props.contingencyError ? (
            <small id="contingency-error" style="color: #e74c3c; font-size: 0.875rem; display: block; margin-top: 4px;" role="alert">
              {props.contingencyError}
            </small>
          ) : (
            <small id="contingency-help" style="color: #7f8c8d; font-size: 0.875rem;">
              Added buffer for unexpected costs (can exceed 100%)
            </small>
          )}
        </div>

        {/* Other Venue Overrides (only show in compare mode) */}
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
    </div>
  );
}