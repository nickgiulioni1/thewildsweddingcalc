# Wedding Cost Estimator Widget

A lightweight, embeddable wedding cost estimation tool for **The Wilds** and **Laural Mill** venues.

## Features

- 🎯 **Real-time cost calculations** based on guest count, date, meal style, and bar service
- 📊 **Side-by-side comparison** with typical "other venues" that don't include planning, setup, etc.
- ✏️ **Editable assumptions** for all cost categories
- 📤 **Export options**: CSV download and print/PDF save
- ♿ **Fully accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- 📱 **Responsive design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Lightweight**: < 50KB gzipped, loads in < 1s

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Embedding the Widget

Add this HTML to your page:

```html
<!-- Container for the widget -->
<div id="wedding-cost-estimator"></div>

<!-- Widget script -->
<script src="dist/widget.js" defer></script>
```

## Configuration

All default values are stored in `config/config.ts`:

### Venue Fees
```typescript
VENUE_FEES = {
  wilds: {
    monday_thursday: 6000,
    friday_sunday: 7000,
    saturday_holiday: 8000,
  },
  laural: {
    monday_thursday: 3500,
    friday_sunday: 4200,
    saturday_holiday: 5000,
  },
}
```

### Food & Bar Costs
```typescript
FOOD = {
  basePerGuest: 40,  // Buffet baseline
  deltasPerGuest: {
    buffet: 0,
    family: 6,
    plated: 12,
  },
}

BAR = {
  ourVenueTiers: [
    { id: 'house', label: 'House Bar', perGuest: 28 },
    { id: 'premium', label: 'Premium Bar', perGuest: 34 },
    { id: 'topShelf', label: 'Top Shelf Bar', perGuest: 42 },
  ],
}
```

### Wedding Categories (Indianapolis defaults)
```typescript
WEDDING_CATEGORIES = {
  photography: 2000,
  videography: 1800,
  flowers: 3500,
  djMusic: 1500,
  invitations: 550,
  transportation: 400,
  hairMakeup: 600,
  cakeDesserts: 800,
}
```

### Percentages
```typescript
PERCENTAGES = {
  service: 20,      // Applied to non-venue items only
  tax: 7,           // Applied to subtotal + service
  gratuity: 0,      // Applied to same base as service
  contingency: 10,  // Applied at end to total
}
```

## How It Works

### Calculation Order

The widget applies costs in this specific order:

1. **Line items** (food, bar, photography, etc.)
2. **Venue fee** (kept separate)
3. **Service %** applied to line items ONLY (not venue fee)
4. **Tax %** applied to (line items + service)
5. **Gratuity %** applied to line items ONLY (same base as service)
6. **Subtotal with fees** = line items + venue fee + service + tax + gratuity
7. **Contingency %** applied to subtotal with fees
8. **Final total** = subtotal with fees + contingency

### Date Pricing Bands

Dates are mapped to three pricing bands:

- **monday_thursday**: Monday through Thursday
- **friday_sunday**: Friday and Sunday
- **saturday_holiday**: Saturdays and major US holidays
  - New Year's Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas, New Year's Eve

### "Other Venue" Comparison

When comparison mode is enabled:

- **Venue fee** = Wilds fee - $1,000 (for same date/band)
- **Auto-adds** costs typically not included:
  - Tables & Chairs Rental: $1,500
  - Basic Décor Rentals: $1,200
  - External Planner/DOC: $2,000
  - Ceremony Audio: $400
  - Cleaning: $350
  - Setup/Teardown: $500
- **Food/bar** costs remain the same (for fair comparison)
- Typically results in **Other Venue** total being **higher** than our venues

## Testing

The project includes comprehensive test coverage:

```bash
npm test
```

Test suites cover:

1. Venue fee mapping & guest bounds
2. Service/tax exclusion logic (venue fee exempt)
3. Meal style deltas
4. Other venue comparison
5. CSV export formats

## Accessibility

The widget is fully accessible:

- ✅ All inputs have proper labels
- ✅ Keyboard navigation for all interactions
- ✅ Focus indicators clearly visible
- ✅ `aria-live` regions for dynamic totals
- ✅ Color contrast meets WCAG 2.1 AA
- ✅ Screen reader friendly
- ✅ Semantic HTML throughout

## Performance

- **Bundle size**: < 50KB gzipped
- **Time to Interactive (TTI)**: < 1s on mid-tier mobile
- **Real-time updates**: < 100ms calculation time
- **No third-party trackers**

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Support

For questions or customization requests, contact The Wilds/Laural Mill team.

---

**Built with**: TypeScript, Preact, Vite

