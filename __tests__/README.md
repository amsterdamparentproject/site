# Form Submission Tests - Groups Directory

This directory contains comprehensive tests for the form submission logic in the groups directory forms (AddGroupForm, ChangeGroupForm, and RequestAccessForm).

## Test Files Overview

### `__tests__/utils/formValidation.test.ts`

Tests for reusable form validation and data transformation utilities:

- **Email Validation**: Validates email format patterns used across forms
- **Form Data Construction** (AddGroupForm): Tests FormData object creation with all required fields
- **Form Data Construction** (ChangeGroupForm): Tests FormData object creation with originalGroupName tracking
- **Form Validation Rules**: Tests the validation logic (adminName, email, agreedToTerms)
- **Category Handling**: Tests category string splitting and joining

### `__tests__/forms/AddGroupForm.test.ts`

Tests specific to AddGroupForm submission behavior:

- **Form Data Output**: Verifies the exact format of FormData sent on submission
- **Form Validation**: Tests when submissions are allowed/rejected
- **Data Prepopulation**: Tests user info prepopulation from props
- **Category Selection Output**: Tests category formatting in output
- **Boolean Conversion**: Tests agreedToTerms (true/false) to "Yes"/"No" conversion

### `__tests__/forms/ChangeGroupForm.test.ts`

Tests specific to ChangeGroupForm submission behavior:

- **Form Data Output**: Tests originalGroupName tracking and FormData construction
- **Category Initialization**: Tests parsing categories from string format to array
- **Form Validation**: Tests validation in edit mode
- **Data Prepopulation**: Tests prepopulation from existing group data
- **Output Format Consistency**: Tests consistent formatting of output fields
- **Edge Cases**: Tests partial updates, category additions/removals, etc.

## Running the Tests

### Option 1: Using Vitest (Recommended)

```bash
# Install vitest and @vitest/ui
yarn add --dev vitest @vitest/ui

# Run tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with UI
yarn test --ui
```

### Option 2: Using Jest

```bash
# Install Jest and related dependencies
yarn add --dev jest @testing-library/react @testing-library/jest-dom ts-jest

# Run tests
yarn jest

# Run tests in watch mode
yarn jest --watch
```

## Configuration

### For Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### For Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
};
```

## Test Coverage

The current test suite covers:

### Validation Logic

- ✅ Email format validation
- ✅ Admin name validation (non-empty, non-whitespace)
- ✅ Terms agreement requirement
- ✅ Multiple validation errors

### Data Output

- ✅ AddGroupForm data construction
- ✅ ChangeGroupForm data construction
- ✅ Category joining with ", " separator
- ✅ Boolean to string conversion ("Yes"/"No")
- ✅ Empty fields handling

### Edge Cases

- ✅ Empty categories array
- ✅ Single category selection
- ✅ Multiple category selection
- ✅ Categories with special characters
- ✅ Missing user information
- ✅ Whitespace-only inputs

### Form-Specific Logic

- **AddGroupForm**:
  - User info prepopulation
  - Empty notes handling
- **ChangeGroupForm**:
  - Original group name tracking
  - Category string parsing
  - Security (no invite link prefill)
  - Partial updates (only changing specific fields)

## Adding New Tests

When adding new form fields or validation rules:

1. Add test cases to the appropriate `describe` block
2. Follow the naming pattern: `should [action] with [condition]`
3. Test both success and failure cases
4. Document edge cases
5. Keep tests focused on data transformation and validation

Example test structure:

```typescript
it("should [specific behavior description]", () => {
  const input = {
    /* test data */
  };
  const result = functionToTest(input);
  expect(result).toEqual(expectedOutput);
});
```

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
- name: Run tests
  run: yarn test
```

## Related Documentation

- [Form Submission Flow](../../../docs/GROUPS_DIRECTORY.md)
- [AddGroupForm Component](../components/groups-directory/AddGroupForm.tsx)
- [ChangeGroupForm Component](../components/groups-directory/ChangeGroupForm.tsx)
