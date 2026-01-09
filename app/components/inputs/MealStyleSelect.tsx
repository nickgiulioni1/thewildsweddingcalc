import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { MealStyle } from '../../../config/config';
import { Tooltip } from '../Tooltip';

interface MealStyleSelectProps {
  value: MealStyle;
  onChange: (style: MealStyle) => void;
}

/**
 * Meal style selector component.
 * Allows selection between buffet, family style, and plated service.
 */
export function MealStyleSelect({ value, onChange }: MealStyleSelectProps) {
  return (
    <div class="input-group">
      <label for="meal-style">
        Meal Style
        <Tooltip text="Different meal styles have different per-guest costs. Buffet is typically most affordable." />
      </label>
      <select
        id="meal-style"
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value as MealStyle)}
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
  );
}
