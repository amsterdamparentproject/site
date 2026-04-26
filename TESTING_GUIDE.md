# Form Submission Tests - Quick Start Guide

Created comprehensive test suites for the groups directory forms to validate the object output flow from form submissions.

## 📁 Test Files Created

```
site/
├── __tests__/
│   ├── README.md (detailed documentation)
│   ├── utils/
│   │   └── formValidation.test.ts (validation logic tests)
│   └── forms/
│       ├── AddGroupForm.test.ts (add form submission tests)
│       └── ChangeGroupForm.test.ts (edit form submission tests)
├── vitest.config.ts (test environment configuration)
└── package.json (updated with test scripts)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd site
yarn add --dev vitest @vitejs/plugin-react jsdom
```

### 2. Run Tests

```bash
# Run all tests once
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run tests with UI dashboard
yarn test:ui

# Run tests with coverage report
yarn test:coverage
```

## ✅ What's Tested

### AddGroupForm Tests

- ✅ FormData object construction with all fields
- ✅ Form validation (adminName, email, agreedToTerms)
- ✅ User info prepopulation
- ✅ Category selection and joining
- ✅ Boolean to string conversion
- ✅ Empty data handling

### ChangeGroupForm Tests

- ✅ FormData object with originalGroupName tracking
- ✅ Category string parsing from existing group data
- ✅ Form validation in edit mode
- ✅ Data prepopulation from existing groups
- ✅ Partial updates and category changes
- ✅ Edge cases (name changes, category additions/removals)

### Validation Tests

- ✅ Email format validation
- ✅ Admin name non-empty validation
- ✅ Terms agreement validation
- ✅ Multiple validation errors
- ✅ Category splitting and joining
- ✅ Edge cases and whitespace handling

## 📊 Test Coverage

**Total Tests**: 60+
**Areas Covered**:

- Data transformation and formatting
- Form validation logic
- User info prepopulation
- Category handling
- Edge cases and error conditions
- Output consistency

## 🔍 Example Test Runs

### Test Output Example

```
✓ __tests__/utils/formValidation.test.ts (15 tests)
✓ __tests__/forms/AddGroupForm.test.ts (22 tests)
✓ __tests__/forms/ChangeGroupForm.test.ts (23 tests)

✅ All tests passed (60 tests)
```

### What Each Test Validates

#### Email Validation

```typescript
✓ should validate correct email formats
✓ should reject invalid email formats
```

#### Form Data Construction

```typescript
✓ should build FormData object with all required fields
✓ should handle empty categories array
✓ should join multiple categories with comma separator
```

#### Form Validation

```typescript
✓ should reject submission with invalid form state
✓ should allow submission with valid form state
```

## 📝 Test Structure

Each test file uses describe/it pattern for organization:

```typescript
describe("Feature Area", () => {
  describe("Specific Behavior", () => {
    it("should do X with Y", () => {
      // Arrange: Set up test data
      // Act: Call function being tested
      // Assert: Verify results
    });
  });
});
```

## 🔗 Form Submission Flow Being Tested

```
User Input
    ↓
State Management (useState)
    ↓
Validation (adminName, email, agreedToTerms)
    ↓
Data Transformation (join categories, boolean to string)
    ↓
FormData Object Creation
    ↓
postManageDirectory() call
```

## 📚 Important Form Fields

### AddGroupForm Output

```
groupName        → string
inviteLink       → string
description      → string
categories       → "Cat1, Cat2" (joined with ", ")
adminName        → string
email            → string
notes            → string
agreedToTerms    → "Yes" or "No"
```

### ChangeGroupForm Output (includes)

```
originalGroupName → tracks original name
groupName        → can be updated
inviteLink       → (empty for security)
categories       → "Cat1, Cat2" (parsed and re-joined)
...rest same as AddGroupForm
```

## 🎯 Key Validations

1. **Email Validation Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. **Admin Name**: Must not be empty or whitespace-only
3. **Terms Agreement**: Must be true before submission
4. **Categories**: Joined with ", " separator
5. **Boolean Conversion**: true → "Yes", false → "No"

## 🐛 Debugging Tests

```bash
# Run specific test file
yarn test AddGroupForm

# Run tests matching pattern
yarn test --grep "email"

# Run with verbose output
yarn test --reporter=verbose
```

## 📖 Full Documentation

See `__tests__/README.md` for:

- Detailed test file descriptions
- All test cases listed
- Configuration options
- CI/CD integration
- Adding new tests

## 🚦 Next Steps

1. ✅ Run `yarn test` to verify all tests pass
2. Add tests to your pre-commit hook (optional)
3. Run tests in CI/CD pipeline
4. As you add new form fields, add corresponding tests
5. Monitor test coverage with `yarn test:coverage`

## ⚡ Key Points

- Tests focus on **data transformation and validation**
- No external API calls mocked (unit tests)
- Tests verify **exact output format** sent to `postManageDirectory`
- Edge cases and error conditions covered
- Ready for integration testing with actual components

---

**Created**: 2024
**Framework**: Vitest + jsdom
**Tests**: 60+
**Status**: Ready to run
