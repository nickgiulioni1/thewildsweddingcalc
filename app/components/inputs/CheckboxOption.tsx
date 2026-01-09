import { h, ComponentChildren } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface CheckboxOptionProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ComponentChildren;
}

/**
 * Reusable checkbox option component with label support.
 */
export function CheckboxOption({ id, checked, onChange, children }: CheckboxOptionProps) {
  return (
    <div class="input-group">
      <div class="checkbox-option">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
        />
        <label for={id}>{children}</label>
      </div>
    </div>
  );
}
