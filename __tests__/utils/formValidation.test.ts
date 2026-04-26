/**
 * Form Validation Tests
 * Tests for reusable form validation and data transformation logic
 */

describe("Form Validation Utils", () => {
  describe("Email Validation", () => {
    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    it("should validate correct email formats", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@example.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("invalid@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user @example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("Form Data Construction - AddGroupForm", () => {
    const buildAddGroupFormData = (input: {
      groupName: string;
      inviteLink: string;
      description: string;
      categories: string[];
      adminName: string;
      email: string;
      notes: string;
      agreedToTerms: boolean;
    }): Record<string, string> => {
      const selectedCategories = input.categories.join(", ");
      return {
        groupName: input.groupName,
        inviteLink: input.inviteLink,
        description: input.description,
        categories: selectedCategories,
        adminName: input.adminName,
        email: input.email,
        notes: input.notes,
        agreedToTerms: input.agreedToTerms ? "Yes" : "No",
      };
    };

    it("should construct complete form data object", () => {
      const result = buildAddGroupFormData({
        groupName: "Test Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "A test group",
        categories: ["Parenting", "Mom"],
        adminName: "Jane Doe",
        email: "jane@example.com",
        notes: "Additional info",
        agreedToTerms: true,
      });

      expect(result).toEqual({
        groupName: "Test Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "A test group",
        categories: "Parenting, Mom",
        adminName: "Jane Doe",
        email: "jane@example.com",
        notes: "Additional info",
        agreedToTerms: "Yes",
      });
    });

    it("should handle empty categories array", () => {
      const result = buildAddGroupFormData({
        groupName: "Test Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "A test group",
        categories: [],
        adminName: "Jane Doe",
        email: "jane@example.com",
        notes: "",
        agreedToTerms: true,
      });

      expect(result.categories).toBe("");
    });

    it("should convert agreedToTerms boolean correctly", () => {
      const trueResult = buildAddGroupFormData({
        groupName: "Test",
        inviteLink: "",
        description: "",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      });

      const falseResult = buildAddGroupFormData({
        groupName: "Test",
        inviteLink: "",
        description: "",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: false,
      });

      expect(trueResult.agreedToTerms).toBe("Yes");
      expect(falseResult.agreedToTerms).toBe("No");
    });

    it("should join multiple categories with comma separator", () => {
      const result = buildAddGroupFormData({
        groupName: "Test",
        inviteLink: "",
        description: "",
        categories: ["Activities", "Language & country", "Buy & sell"],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      });

      expect(result.categories).toBe(
        "Activities, Language & country, Buy & sell",
      );
    });
  });

  describe("Form Data Construction - ChangeGroupForm", () => {
    const buildChangeGroupFormData = (input: {
      originalGroupName: string;
      groupName: string;
      inviteLink: string;
      description: string;
      categories: string[];
      adminName: string;
      email: string;
      notes: string;
      agreedToTerms: boolean;
    }): Record<string, string> => {
      const selectedCategories = input.categories.join(", ");
      return {
        originalGroupName: input.originalGroupName,
        groupName: input.groupName,
        inviteLink: input.inviteLink,
        description: input.description,
        categories: selectedCategories,
        adminName: input.adminName,
        email: input.email,
        notes: input.notes,
        agreedToTerms: input.agreedToTerms ? "Yes" : "No",
      };
    };

    it("should construct complete form data object with original group name", () => {
      const result = buildChangeGroupFormData({
        originalGroupName: "Old Group Name",
        groupName: "New Group Name",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Updated description",
        categories: ["Dad", "Twin"],
        adminName: "John Doe",
        email: "john@example.com",
        notes: "Update notes",
        agreedToTerms: true,
      });

      expect(result).toEqual({
        originalGroupName: "Old Group Name",
        groupName: "New Group Name",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Updated description",
        categories: "Dad, Twin",
        adminName: "John Doe",
        email: "john@example.com",
        notes: "Update notes",
        agreedToTerms: "Yes",
      });
    });

    it("should preserve original group name even if changed", () => {
      const result = buildChangeGroupFormData({
        originalGroupName: "Original",
        groupName: "Changed",
        inviteLink: "",
        description: "",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      });

      expect(result.originalGroupName).toBe("Original");
      expect(result.groupName).toBe("Changed");
    });
  });

  describe("Form Validation Rules", () => {
    const validateFormData = (data: {
      adminName: string;
      email: string;
      agreedToTerms: boolean;
    }): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!data.adminName.trim()) {
        errors.push("Admin name is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Email is invalid");
      }

      if (!data.agreedToTerms) {
        errors.push("Must agree to terms");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    };

    it("should validate correct form data", () => {
      const result = validateFormData({
        adminName: "John Doe",
        email: "john@example.com",
        agreedToTerms: true,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject empty admin name", () => {
      const result = validateFormData({
        adminName: "",
        email: "john@example.com",
        agreedToTerms: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Admin name is required");
    });

    it("should reject whitespace-only admin name", () => {
      const result = validateFormData({
        adminName: "   ",
        email: "john@example.com",
        agreedToTerms: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Admin name is required");
    });

    it("should reject invalid email", () => {
      const result = validateFormData({
        adminName: "John Doe",
        email: "invalid-email",
        agreedToTerms: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Email is invalid");
    });

    it("should reject when terms not agreed", () => {
      const result = validateFormData({
        adminName: "John Doe",
        email: "john@example.com",
        agreedToTerms: false,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Must agree to terms");
    });

    it("should collect multiple errors", () => {
      const result = validateFormData({
        adminName: "",
        email: "invalid",
        agreedToTerms: false,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(3);
      expect(result.errors).toContain("Admin name is required");
      expect(result.errors).toContain("Email is invalid");
      expect(result.errors).toContain("Must agree to terms");
    });
  });

  describe("Category Handling", () => {
    const splitCategories = (categoryString: string): string[] => {
      return categoryString
        .split(", ")
        .filter((cat) => cat.trim() !== "")
        .map((cat) => cat.trim());
    };

    const joinCategories = (categories: string[]): string => {
      return categories.join(", ");
    };

    it("should split categories from string", () => {
      const result = splitCategories("Parenting, Mom, Activities");
      expect(result).toEqual(["Parenting", "Mom", "Activities"]);
    });

    it("should handle empty category string", () => {
      const result = splitCategories("");
      expect(result).toEqual([]);
    });

    it("should join categories to string", () => {
      const result = joinCategories(["Dad", "Twin"]);
      expect(result).toBe("Dad, Twin");
    });

    it("should handle empty categories array", () => {
      const result = joinCategories([]);
      expect(result).toBe("");
    });

    it("should roundtrip categories", () => {
      const original = ["Parenting", "Mom", "Activities"];
      const joined = joinCategories(original);
      const split = splitCategories(joined);
      expect(split).toEqual(original);
    });
  });
});
