# Wedding Cost Estimator - Improvement TODO

## 🔴 Critical Priority (Start Here)

### ✅ Input Validation - COMPLETED
- [x] Date validation (valid ISO format, not past dates, reasonable future dates)
- [x] Percentage validation (0-100% range, handle NaN/negative values)
- [x] Edge case handling (division by zero, invalid guest counts)
- [x] Visual feedback when inputs are clamped/validated

### ✅ Error Handling - COMPLETED
- [x] Add error boundaries for React/Preact rendering errors
- [x] Try-catch blocks around calculations
- [x] Graceful degradation when calculations fail
- [x] User-friendly error messages

### ✅ User Feedback - COMPLETED
- [x] Show warning when guest count is clamped
- [x] Display validation error messages for invalid inputs
- [x] Add `aria-invalid` attributes for accessibility
- [ ] Loading states (if needed for future async operations)

## 🟡 High Priority

### ✅ Performance Optimizations - PARTIALLY COMPLETE
- [ ] Memoize expensive calculations (useMemo for calculation results)
- [ ] Optimize line item lookups (use Map instead of Array.find in loops)
- [ ] Debounce rapid input changes (optional, for future)
- [x] Review useEffect dependencies

### ✅ Logging Utility - COMPLETED
- [x] Create `lib/logger.ts` with environment-aware logging
- [x] Replace console.log with logger utility
- [x] Log levels (debug, info, warn, error)
- [x] Disable in production builds

### ✅ LocalStorage Persistence - COMPLETED
- [x] Save user inputs to localStorage
- [x] Restore state on page load
- [ ] Clear old data (optional expiration)

### ✅ Type Safety Improvements - PARTIALLY COMPLETE
- [x] Replace `Record<string, number>` with specific override types
- [x] Better type definitions for category overrides
- [ ] Add type guards for runtime validation

## 🟢 Medium Priority

### ✅ Testing - PARTIALLY COMPLETE
- [x] Add component tests (Vitest + Testing Library)
- [ ] Edge case tests (invalid dates, negative values, NaN)
- [ ] Holiday detection tests
- [x] Error handling tests
- [ ] Accessibility tests

### ✅ Code Organization - COMPLETED
- [x] Extract complex state logic to custom hooks
- [x] Refactor widget.tsx if it exceeds 300 lines
- [x] Consider splitting large components

### ✅ Accessibility Enhancements - COMPLETED
- [x] Add ARIA descriptions for complex calculations
- [x] Form validation error announcements
- [x] Better keyboard navigation hints
- [x] Screen reader optimizations

## 🔵 Lower Priority

### Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Document component prop interfaces
- [ ] Add inline comments for complex logic

### ESLint Configuration
- [ ] Add eslint-plugin-jsx-a11y for accessibility
- [ ] Add more strict TypeScript rules
- [ ] Configure import ordering

### Export Features
- [ ] Add JSON export option
- [ ] Improve CSV export metadata
- [ ] Optimize print view formatting

### Internationalization (Future)
- [ ] Extract hard-coded strings
- [ ] Currency formatting utilities
- [ ] Language support infrastructure

---

## Progress Tracking

- **Started**: January 2024
- **Last Updated**: January 2026
- **Status**: Core functionality complete, refinements ongoing

## Completed Components
- `app/components/ErrorBoundary.tsx` - Error boundary wrapper
- `app/lib/logger.ts` - Environment-aware logging
- `app/lib/storage.ts` - LocalStorage persistence
- `app/lib/validation.ts` - Input validation rules
- `app/hooks/useValidationHandlers.ts` - Validation state management
- `app/hooks/useOverrideHandlers.ts` - Override state management
- `app/hooks/useWeddingCalculator.ts` - Main calculator state

