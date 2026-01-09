import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface VenueHeaderProps {
  name: string;
  url?: string;
}

/**
 * Renders a venue name as a table header.
 * Optionally wraps the name in a link if a URL is provided.
 */
export function VenueHeader({ name, url }: VenueHeaderProps) {
  if (url) {
    return (
      <th class="amount">
        <a href={url} target="_blank" rel="noopener noreferrer" class="venue-link-header">
          {name}
        </a>
      </th>
    );
  }

  return <th class="amount">{name}</th>;
}
