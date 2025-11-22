import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  return (
    <span class="tooltip-wrapper">
      <span class="tooltip-icon">?</span>
      <span class="tooltip-content">{text}</span>
    </span>
  );
}


