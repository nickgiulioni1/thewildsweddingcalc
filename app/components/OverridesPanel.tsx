import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState } from 'preact/hooks';
import { WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../../config/config';
import { Tooltip } from './Tooltip';

interface OverridesPanelProps {
  overrides: Record<string, number>;
  onOverrideChange: (category: string, value: number) => void;
  onResetOverrides: () => void;
  calculatedFoodCost?: number; // The calculated food cost based on guests and meal style
}

export function OverridesPanel({ overrides, onOverrideChange, onResetOverrides, calculatedFoodCost }: OverridesPanelProps) {
  // OverridesPanel rendered - removed console.log per logger utility

  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (category: string, value: string) => {
    // For food category, if empty or matches calculated, remove override
    if (category === 'food' && (value === '' || value.trim() === '')) {
      // Pass undefined or null to indicate remove override
      onOverrideChange(category, NaN); // Use NaN as a signal to remove
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      // If not a valid number, use 0 for non-food categories
      if (category !== 'food') {
        onOverrideChange(category, 0);
      }
      return;
    }
    onOverrideChange(category, numValue);
  };

  const hasOverrides = Object.values(overrides).some(value => value > 0);

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
        aria-controls="overrides-content"
      >
        <span>
          Customize Category Costs
          {hasOverrides && <span style="color: #8d6e63; margin-left: 8px;">● Customized</span>}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div
        id="overrides-content"
        class={`accordion-content ${!isOpen ? 'collapsed' : ''}`}
      >
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; color: #6d4c41; font-size: 0.9rem;">
            Override default costs for any category. Food cost is calculated automatically based on guests and meal style unless you override it.
          </p>
          <button 
            class="btn btn-secondary" 
            onClick={onResetOverrides}
            style="font-size: 0.875rem; padding: 6px 12px;"
          >
            Reset All to Defaults
          </button>
        </div>
        
        <div class="overrides-grid">
          {Object.entries(WEDDING_CATEGORIES).map(([key, category]) => {
            // Special handling for food category
            const isFood = key === 'food';
            const displayValue = isFood ? (overrides[key] ?? calculatedFoodCost ?? 0) : (overrides[key] ?? category.default);
            const defaultText = isFood ? 
              `Calculated: $${(calculatedFoodCost ?? 0).toLocaleString()} (based on guests & meal style)` :
              `Default: $${category.default.toLocaleString()}`;
            
            return (
              <div key={key} class="input-group">
                <label for={`override-${key}`}>
                  {category.name}
                  {isFood && <Tooltip text="Food cost is calculated based on guest count and meal style. Override to set a custom amount." />}
                  <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                    {defaultText}
                  </small>
                </label>
                <input
                  type="number"
                  id={`override-${key}`}
                  min="0"
                  step="50"
                  value={displayValue}
                  onChange={(e) => handleInputChange(key, (e.target as HTMLInputElement).value)}
                  placeholder={isFood ? (calculatedFoodCost ?? 0).toString() : category.default.toString()}
                />
              </div>
            );
          })}
          
          {/* Include the "included" items that cost extra at other venues */}
          <div key="tablesChairs" class="input-group">
            <label for="override-tablesChairs">
              Tables & Chairs
              <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                Default: ${OTHER_VENUE_DEFAULTS.tablesChairs.toLocaleString()}
              </small>
            </label>
            <input
              type="number"
              id="override-tablesChairs"
              min="0"
              step="50"
              value={overrides.tablesChairs ?? OTHER_VENUE_DEFAULTS.tablesChairs}
              onChange={(e) => handleInputChange('tablesChairs', (e.target as HTMLInputElement).value)}
              placeholder={OTHER_VENUE_DEFAULTS.tablesChairs.toString()}
            />
          </div>
          
          <div key="coreDecor" class="input-group">
            <label for="override-coreDecor">
              Core Décor
              <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                Default: ${OTHER_VENUE_DEFAULTS.coreDecor.toLocaleString()}
              </small>
            </label>
            <input
              type="number"
              id="override-coreDecor"
              min="0"
              step="50"
              value={overrides.coreDecor ?? OTHER_VENUE_DEFAULTS.coreDecor}
              onChange={(e) => handleInputChange('coreDecor', (e.target as HTMLInputElement).value)}
              placeholder={OTHER_VENUE_DEFAULTS.coreDecor.toString()}
            />
          </div>
          
          <div key="dayOfCoordination" class="input-group">
            <label for="override-dayOfCoordination">
              Day-of Coordination
              <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                Default: ${OTHER_VENUE_DEFAULTS.dayOfCoordination.toLocaleString()}
              </small>
            </label>
            <input
              type="number"
              id="override-dayOfCoordination"
              min="0"
              step="50"
              value={overrides.dayOfCoordination ?? OTHER_VENUE_DEFAULTS.dayOfCoordination}
              onChange={(e) => handleInputChange('dayOfCoordination', (e.target as HTMLInputElement).value)}
              placeholder={OTHER_VENUE_DEFAULTS.dayOfCoordination.toString()}
            />
          </div>
          
          <div key="cleaning" class="input-group">
            <label for="override-cleaning">
              Cleaning
              <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                Default: ${OTHER_VENUE_DEFAULTS.cleaning.toLocaleString()}
              </small>
            </label>
            <input
              type="number"
              id="override-cleaning"
              min="0"
              step="50"
              value={overrides.cleaning ?? OTHER_VENUE_DEFAULTS.cleaning}
              onChange={(e) => handleInputChange('cleaning', (e.target as HTMLInputElement).value)}
              placeholder={OTHER_VENUE_DEFAULTS.cleaning.toString()}
            />
          </div>
          
          <div key="externalPlanner" class="input-group">
            <label for="override-externalPlanner">
              External Planner
              <small style="display: block; color: #7f8c8d; font-weight: normal; margin-top: 2px;">
                Default: ${EXTERNAL_PLANNER_COST.toLocaleString()}
              </small>
            </label>
            <input
              type="number"
              id="override-externalPlanner"
              min="0"
              step="50"
              value={overrides.externalPlanner ?? EXTERNAL_PLANNER_COST}
              onChange={(e) => handleInputChange('externalPlanner', (e.target as HTMLInputElement).value)}
              placeholder={EXTERNAL_PLANNER_COST.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
