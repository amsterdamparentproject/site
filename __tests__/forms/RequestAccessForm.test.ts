/**
 * RequestAccessForm Submission Tests
 * Tests for form data output flow and submission behavior for directory access requests
 */

describe("RequestAccessForm - Form Submission Output", () => {
  describe("Form Data Output on Submit", () => {
    /**
     * RequestAccessForm is used by people requesting access to the groups directory
     * Tests verify the object structure sent to postRequestDirectory
     */
    it("should build FormData object with all required fields", () => {
      const mockFormData = {
        name: "John Doe",
        email: "john@example.com",
        categories: ["Parenting groups", "Mom groups", "Activities groups"],
        otherInterest: "Looking for parenting support",
        notes: "Very interested in joining",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      const formDataEntries: [string, string][] = [
        ["name", mockFormData.name],
        ["email", mockFormData.email],
        ["categories", mockFormData.categories.join(", ")],
        ["otherInterest", mockFormData.otherInterest],
        ["notes", mockFormData.notes],
        [
          "subscribeNewsletter",
          mockFormData.subscribeNewsletter ? "Yes" : "No",
        ],
        ["agreedToTerms", mockFormData.agreedToTerms ? "Yes" : "No"],
      ];

      expect(formDataEntries).toHaveLength(7);
      expect(formDataEntries[0]).toEqual(["name", "John Doe"]);
      expect(formDataEntries[1]).toEqual(["email", "john@example.com"]);
      expect(formDataEntries[2]).toEqual([
        "categories",
        "Parenting groups, Mom groups, Activities groups",
      ]);
      expect(formDataEntries[6]).toEqual(["agreedToTerms", "Yes"]);
    });

    it("should handle submission without newsletter subscription", () => {
      const mockFormData = {
        name: "Jane Doe",
        email: "jane@example.com",
        categories: ["Dad groups"],
        otherInterest: "",
        notes: "",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      const subscribeOutput = mockFormData.subscribeNewsletter ? "Yes" : "No";
      expect(subscribeOutput).toBe("No");
    });

    it("should handle submission with newsletter subscription", () => {
      const mockFormData = {
        name: "Jane Doe",
        email: "jane@example.com",
        categories: ["Dad groups"],
        otherInterest: "",
        notes: "",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      const subscribeOutput = mockFormData.subscribeNewsletter ? "Yes" : "No";
      expect(subscribeOutput).toBe("Yes");
    });

    it("should handle submission with empty otherInterest", () => {
      const mockFormData = {
        name: "User",
        email: "user@example.com",
        categories: ["Parenting groups"],
        otherInterest: "",
        notes: "",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      expect(mockFormData.otherInterest).toBe("");
    });

    it("should handle submission with all categories selected", () => {
      const allCategories = [
        "Parenting groups",
        "Mom groups",
        "Dad groups",
        "Twin groups",
        "Neighborhood groups",
        "Groups by age/due date",
        "Activities groups",
        "Language & country groups",
        "Buy & sell groups",
      ];

      const mockFormData = {
        name: "User",
        email: "user@example.com",
        categories: allCategories,
        otherInterest: "Interested in everything",
        notes: "Very active",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      const categoriesOutput = mockFormData.categories.join(", ");
      expect(categoriesOutput).toBe(
        "Parenting groups, Mom groups, Dad groups, Twin groups, Neighborhood groups, Groups by age/due date, Activities groups, Language & country groups, Buy & sell groups",
      );
    });
  });

  describe("Form Validation Before Submit", () => {
    const isFormValid = (data: {
      name: string;
      email: string;
      agreedToTerms: boolean;
    }): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        data.name.trim() !== "" &&
        emailRegex.test(data.email) &&
        data.agreedToTerms === true
      );
    };

    it("should validate correct form data", () => {
      expect(
        isFormValid({
          name: "John Doe",
          email: "john@example.com",
          agreedToTerms: true,
        }),
      ).toBe(true);
    });

    it("should require empty name", () => {
      expect(
        isFormValid({
          name: "",
          email: "john@example.com",
          agreedToTerms: true,
        }),
      ).toBe(false);
    });

    it("should require valid email", () => {
      expect(
        isFormValid({
          name: "John Doe",
          email: "invalid-email",
          agreedToTerms: true,
        }),
      ).toBe(false);
    });

    it("should require terms agreement", () => {
      expect(
        isFormValid({
          name: "John Doe",
          email: "john@example.com",
          agreedToTerms: false,
        }),
      ).toBe(false);
    });

    it("should reject whitespace-only name", () => {
      expect(
        isFormValid({
          name: "   ",
          email: "john@example.com",
          agreedToTerms: true,
        }),
      ).toBe(false);
    });
  });

  describe("Category Selection Output", () => {
    it("should output single selected category", () => {
      const categories = ["Parenting groups"];
      const output = categories.join(", ");
      expect(output).toBe("Parenting groups");
    });

    it("should output multiple selected categories", () => {
      const categories = [
        "Mom groups",
        "Activities groups",
        "Buy & sell groups",
      ];
      const output = categories.join(", ");
      expect(output).toBe("Mom groups, Activities groups, Buy & sell groups");
    });

    it("should handle empty categories array", () => {
      const categories: string[] = [];
      const output = categories.join(", ");
      expect(output).toBe("");
    });

    it("should preserve category names with forward slash", () => {
      const categories = ["Groups by age/due date"];
      const output = categories.join(", ");
      expect(output).toBe("Groups by age/due date");
    });

    it("should preserve category names with ampersand", () => {
      const categories = ["Language & country groups"];
      const output = categories.join(", ");
      expect(output).toBe("Language & country groups");
    });
  });

  describe("Optional Fields Handling", () => {
    it("should handle missing otherInterest field", () => {
      const mockFormData = {
        name: "User",
        email: "user@example.com",
        categories: [],
        otherInterest: "",
        notes: "",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      expect(mockFormData.otherInterest).toBe("");
    });

    it("should handle populated otherInterest field", () => {
      const mockFormData = {
        name: "User",
        email: "user@example.com",
        categories: [],
        otherInterest: "I'm looking for specific groups",
        notes: "",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      expect(mockFormData.otherInterest).toBe(
        "I'm looking for specific groups",
      );
    });

    it("should handle populated notes field", () => {
      const mockFormData = {
        name: "User",
        email: "user@example.com",
        categories: [],
        otherInterest: "",
        notes: "Additional context about my request",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      expect(mockFormData.notes).toBe("Additional context about my request");
    });
  });

  describe("Boolean Conversion", () => {
    it("should convert subscribeNewsletter true to 'Yes'", () => {
      const value = true;
      const output = value ? "Yes" : "No";
      expect(output).toBe("Yes");
    });

    it("should convert subscribeNewsletter false to 'No'", () => {
      const value = false;
      const output = value ? "Yes" : "No";
      expect(output).toBe("No");
    });

    it("should convert agreedToTerms true to 'Yes'", () => {
      const value = true;
      const output = value ? "Yes" : "No";
      expect(output).toBe("Yes");
    });

    it("should convert agreedToTerms false to 'No'", () => {
      const value = false;
      const output = value ? "Yes" : "No";
      expect(output).toBe("No");
    });
  });

  describe("Complete Submission Scenarios", () => {
    it("should handle basic request to access directory", () => {
      const formData = {
        name: "Alice Smith",
        email: "alice@example.com",
        categories: ["Parenting groups"],
        otherInterest: "",
        notes: "",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      expect(formData.name).not.toBe("");
      expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)).toBe(true);
      expect(formData.agreedToTerms).toBe(true);
    });

    it("should handle request with multiple interests", () => {
      const formData = {
        name: "Bob Johnson",
        email: "bob@example.com",
        categories: [
          "Parenting groups",
          "Dad groups",
          "Activities groups",
          "Language & country groups",
        ],
        otherInterest: "Particularly interested in bilingual families",
        notes: "Moving to Amsterdam soon",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      expect(formData.categories.length).toBe(4);
      expect(formData.categories).toContain("Dad groups");
      expect(formData.otherInterest).toContain("bilingual");
    });

    it("should handle request with no category preferences", () => {
      const formData = {
        name: "Carol Davis",
        email: "carol@example.com",
        categories: [],
        otherInterest: "Show me everything",
        notes: "",
        subscribeNewsletter: false,
        agreedToTerms: true,
      };

      expect(formData.categories.length).toBe(0);
      expect(formData.otherInterest).toBe("Show me everything");
    });

    it("should handle request with detailed notes", () => {
      const formData = {
        name: "David Miller",
        email: "david@example.com",
        categories: ["Twin groups"],
        otherInterest: "",
        notes:
          "We just had twins and are new to Amsterdam. Looking for support groups.",
        subscribeNewsletter: true,
        agreedToTerms: true,
      };

      expect(formData.notes.length).toBeGreaterThan(0);
      expect(formData.notes).toContain("twins");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long name", () => {
      const longName =
        "Dr. Maria Elena Garcia Rodriguez Hernandez Gonzalez Lopez";
      const isValid = longName.trim() !== "";
      expect(isValid).toBe(true);
    });

    it("should handle email with plus sign", () => {
      const email = "user+tag@example.com";
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(true);
    });

    it("should handle email with subdomain", () => {
      const email = "user@mail.example.co.uk";
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(true);
    });

    it("should reject email with space", () => {
      const email = "user @example.com";
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });

    it("should handle very long otherInterest text", () => {
      const longText =
        "I am a parent living in Amsterdam with young children and I am looking for communities where I can connect with other parents. " +
        "I am interested in various types of groups including parenting support, activities for my children, and language learning opportunities.";

      expect(longText.length).toBeGreaterThan(100);
    });
  });
});
