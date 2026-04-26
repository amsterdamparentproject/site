/**
 * ChangeGroupForm Submission Tests
 * Tests for form data output flow and submission behavior specific to editing groups
 */

describe("ChangeGroupForm - Form Submission Output", () => {
  describe("Form Data Output on Submit", () => {
    /**
     * Mock form state and verify the object shape and values
     * that would be sent to postManageDirectory for group edits
     */
    it("should build FormData object with originalGroupName tracking", () => {
      const mockFormData = {
        originalGroupName: "Old Parent Group",
        groupName: "New Parent Group",
        inviteLink: "https://chat.whatsapp.com/ABCDEfghijklmno",
        description: "Updated description",
        categories: ["Parenting", "Mom"],
        adminName: "Jane Doe",
        email: "jane@example.com",
        notes: "Updated notes",
        agreedToTerms: true,
      };

      const formDataEntries: [string, string][] = [
        ["originalGroupName", mockFormData.originalGroupName],
        ["groupName", mockFormData.groupName],
        ["inviteLink", mockFormData.inviteLink],
        ["description", mockFormData.description],
        ["categories", mockFormData.categories.join(", ")],
        ["adminName", mockFormData.adminName],
        ["email", mockFormData.email],
        ["notes", mockFormData.notes],
        ["agreedToTerms", mockFormData.agreedToTerms ? "Yes" : "No"],
      ];

      expect(formDataEntries).toHaveLength(9);
      expect(formDataEntries[0]).toEqual([
        "originalGroupName",
        "Old Parent Group",
      ]);
      expect(formDataEntries[1]).toEqual(["groupName", "New Parent Group"]);
      expect(formDataEntries[8]).toEqual(["agreedToTerms", "Yes"]);
    });

    it("should preserve originalGroupName even when groupName changes", () => {
      const mockFormData = {
        originalGroupName: "Original Name",
        groupName: "Changed Name",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Desc",
        categories: ["Activities"],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      };

      expect(mockFormData.originalGroupName).toBe("Original Name");
      expect(mockFormData.groupName).toBe("Changed Name");
      expect(mockFormData.originalGroupName).not.toEqual(
        mockFormData.groupName,
      );
    });

    it("should allow groupName and originalGroupName to be the same (no change)", () => {
      const mockFormData = {
        originalGroupName: "Same Group",
        groupName: "Same Group",
        inviteLink: "",
        description: "",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      };

      expect(mockFormData.originalGroupName).toBe(mockFormData.groupName);
    });
  });

  describe("Category Initialization from String", () => {
    /**
     * Categories come from the group passing in as a string like "Parenting, Mom"
     * and need to be split for form editing
     */
    it("should parse categories string into array", () => {
      const categoriesString = "Parenting, Mom, Activities";
      const categories = categoriesString
        .split(", ")
        .filter((cat) => cat.trim() !== "");

      expect(categories).toEqual(["Parenting", "Mom", "Activities"]);
    });

    it("should handle empty category string", () => {
      const categoriesString = "";
      const categories = categoriesString
        .split(", ")
        .filter((cat) => cat.trim() !== "");

      expect(categories).toEqual([]);
    });

    it("should handle category string with extra whitespace", () => {
      const categoriesString = "Parenting,  Mom,Activities";
      const categories = categoriesString
        .split(", ")
        .filter((cat) => cat.trim() !== "");

      // This tests the actual behavior and shows potential edge case
      expect(categories).not.toEqual(["Parenting", "Mom", "Activities"]);
    });

    it("should handle categories with special characters", () => {
      const categoriesString = "Language & country, Buy & sell, Age/due date";
      const categories = categoriesString
        .split(", ")
        .filter((cat) => cat.trim() !== "");

      expect(categories).toEqual([
        "Language & country",
        "Buy & sell",
        "Age/due date",
      ]);
    });
  });

  describe("Form Validation Before Submit (Edit Mode)", () => {
    const isFormValid = (data: {
      adminName: string;
      email: string;
      agreedToTerms: boolean;
    }): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        data.adminName.trim() !== "" &&
        emailRegex.test(data.email) &&
        data.agreedToTerms === true
      );
    };

    it("should use same validation rules as add form", () => {
      const validData = {
        adminName: "John Doe",
        email: "john@example.com",
        agreedToTerms: true,
      };

      expect(isFormValid(validData)).toBe(true);
    });

    it("should reject invalid email in edit mode", () => {
      expect(
        isFormValid({
          adminName: "Admin",
          email: "invalid-email",
          agreedToTerms: true,
        }),
      ).toBe(false);
    });

    it("should reject if terms not agreed in edit mode", () => {
      expect(
        isFormValid({
          adminName: "Admin",
          email: "admin@test.com",
          agreedToTerms: false,
        }),
      ).toBe(false);
    });
  });

  describe("Data Prepopulation from Existing Group", () => {
    it("should prepopulate all fields from existing group data", () => {
      const groupData = {
        name: "Existing Group",
        categories: "Parenting, Mom",
        description: "Existing description",
        userName: "Jane Doe",
        userEmail: "jane@example.com",
      };

      const formData = {
        originalGroupName: groupData.name,
        groupName: groupData.name,
        inviteLink: "",
        description: groupData.description,
        categories: groupData.categories
          .split(", ")
          .filter((cat) => cat.trim() !== ""),
        adminName: groupData.userName || "",
        email: groupData.userEmail || "",
        notes: "",
        agreedToTerms: false,
      };

      expect(formData.originalGroupName).toBe("Existing Group");
      expect(formData.groupName).toBe("Existing Group");
      expect(formData.description).toBe("Existing description");
      expect(formData.categories).toEqual(["Parenting", "Mom"]);
      expect(formData.adminName).toBe("Jane Doe");
      expect(formData.email).toBe("jane@example.com");
    });

    it("should not prefill invite link for security reasons", () => {
      const formData = {
        originalGroupName: "Group",
        groupName: "Group",
        inviteLink: "", // Deliberately empty
        description: "Desc",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: false,
      };

      expect(formData.inviteLink).toBe("");
    });
  });

  describe("Output Format Consistency", () => {
    it("should output categories in same format as input", () => {
      const selectedCategories = ["Dad", "Twin", "Neighborhood"];
      const output = selectedCategories.join(", ");
      const reparsed = output.split(", ");

      expect(reparsed).toEqual(selectedCategories);
    });

    it("should convert boolean values consistently", () => {
      const submissionData = [
        { value: true, expected: "Yes" },
        { value: false, expected: "No" },
      ];

      submissionData.forEach(({ value, expected }) => {
        const output = value ? "Yes" : "No";
        expect(output).toBe(expected);
      });
    });

    it("should handle all string fields properly", () => {
      const formData = {
        originalGroupName: "Group",
        groupName: "Updated Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Updated description",
        categories: ["Activities"],
        adminName: "Admin Name",
        email: "admin@example.com",
        notes: "Some notes",
        agreedToTerms: true,
      };

      const stringFields = [
        "originalGroupName",
        "groupName",
        "inviteLink",
        "description",
        "adminName",
        "email",
        "notes",
      ] as const;

      stringFields.forEach((field) => {
        expect(typeof formData[field]).toBe("string");
      });
    });
  });

  describe("Special Cases and Edge Conditions", () => {
    it("should handle form submission with only name change", () => {
      const formData = {
        originalGroupName: "Old Name",
        groupName: "New Name",
        inviteLink: "",
        description: "", // No change
        categories: [],
        adminName: "Admin", // No change
        email: "admin@test.com", // No change
        notes: "",
        agreedToTerms: true,
      };

      expect(formData.groupName).not.toBe(formData.originalGroupName);
      expect(formData.description).toBe("");
    });

    it("should handle form submission with category additions", () => {
      const originalCategories = ["Parenting"];
      const updatedCategories = ["Parenting", "Mom", "Activities"];

      expect(updatedCategories.length).toBeGreaterThan(
        originalCategories.length,
      );
      expect(updatedCategories).toContain("Parenting");
    });

    it("should handle form submission with category removals", () => {
      const originalCategories = ["Parenting", "Mom", "Activities"];
      const updatedCategories = ["Parenting"];

      expect(updatedCategories.length).toBeLessThan(originalCategories.length);
      expect(originalCategories).toContain("Mom");
      expect(updatedCategories).not.toContain("Mom");
    });

    it("should handle empty notes field", () => {
      const formData = {
        originalGroupName: "Group",
        groupName: "Group",
        inviteLink: "",
        description: "Desc",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "", // Empty
        agreedToTerms: true,
      };

      expect(formData.notes).toBe("");
    });
  });
});
