# Wedding Cost Estimator - Improvement TODO

## 🔴 Critical Priority (Start Here)

### ✅ Input Validation
- [ ] Date validation (valid ISO format, not past dates, reasonable future dates)
- [ ] Percentage validation (0-100% range, handle NaN/negative values)
- [ ] Edge case handling (division by zero, invalid guest counts)
- [ ] Visual feedback when inputs are clamped/validated

### ✅ Error Handling
- [ ] Add error boundaries for React/Preact rendering errors
- [ ] Try-catch blocks around calculations
- [ ] Graceful degradation when calculations fail
- [ ] User-friendly error messages

### ✅ User Feedback
- [ ] Show warning when guest count is clamped
- [ ] Display validation error messages for invalid inputs
- [ ] Add `aria-invalid` attributes for accessibility
- [ ] Loading states (if needed for future async operations)

## 🟡 High Priority

### ✅ Performance Optimizations
- [ ] Memoize expensive calculations (useMemo for calculation results)
- [ ] Optimize line item lookups (use Map instead of Array.find in loops)
- [ ] Debounce rapid input changes (optional, for future)
- [ ] Review useEffect dependencies

### ✅ Logging Utility
- [ ] Create `lib/logger.ts` with environment-aware logging
- [ ] Replace console.log with logger utility
- [ ] Log levels (debug, info, warn, error)
- [ ] Disable in production builds

### ✅ LocalStorage Persistence
- [ ] Save user inputs to localStorage
- [ ] Restore state on page load
- [ ] Clear old data (optional expiration)

### ✅ Type Safety Improvements
- [ ] Replace `Record<string, number>` with specific override types
- [ ] Better type definitions for category overrides
- [ ] Add type guards for runtime validation

## 🟢 Medium Priority

### ✅ Testing
- [ ] Add component tests (Vitest + Testing Library)
- [ ] Edge case tests (invalid dates, negative values, NaN)
- [ ] Error handling tests
- [ ] Accessibility tests

### ✅ Code Organization
- [ ] Extract complex state logic to custom hooks
- [ ] Refactor widget.tsx if it exceeds 300 lines
- [ ] Consider splitting large components

### ✅ Accessibility Enhancements
- [ ] Add ARIA descriptions for complex calculations
- [ ] Form validation error announcements
- [ ] Better keyboard navigation hints
- [ ] Screen reader optimizations

## 🔵 Lower Priority

### ✅ Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Document component prop interfaces
- [ ] Add inline comments for complex logic

### ✅ ESLint Configuration
- [ ] Add eslint-plugin-jsx-a11y for accessibility
- [ ] Add more strict TypeScript rules
- [ ] Configure import ordering

### ✅ Export Features
- [ ] Add JSON export option
- [ ] Improve CSV export metadata
- [ ] Optimize print view formatting

### ✅ Internationalization (Future)
- [ ] Extract hard-coded strings
- [ ] Currency formatting utilities
- [ ] Language support infrastructure

---

## Progress Tracking

- **Started**: [Current Date]
- **Completed**: [Update as items are finished]
- **In Progress**: Input Validation

