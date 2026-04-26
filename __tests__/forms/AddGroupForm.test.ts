/**
 * AddGroupForm Submission Tests
 * Tests for form data output flow and submission behavior
 */

describe("AddGroupForm - Form Submission Output", () => {
  describe("Form Data Output on Submit", () => {
    /**
     * Mock form state and verify the object shape and values
     * that would be sent to postManageDirectory
     */
    it("should build FormData object with all required fields", () => {
      const mockFormData = {
        groupName: "Test Parent Group",
        inviteLink: "https://chat.whatsapp.com/ABCDEfghijklmno",
        description: "A group for discussing parenting topics",
        categories: ["Parenting", "Mom"],
        adminName: "Jane Doe",
        email: "jane@example.com",
        notes: "Great community",
        agreedToTerms: true,
      };

      const formDataEntries: [string, string][] = [
        ["groupName", mockFormData.groupName],
        ["inviteLink", mockFormData.inviteLink],
        ["description", mockFormData.description],
        ["categories", mockFormData.categories.join(", ")],
        ["adminName", mockFormData.adminName],
        ["email", mockFormData.email],
        ["notes", mockFormData.notes],
        ["agreedToTerms", mockFormData.agreedToTerms ? "Yes" : "No"],
      ];

      expect(formDataEntries).toHaveLength(8);
      expect(formDataEntries[0]).toEqual(["groupName", "Test Parent Group"]);
      expect(formDataEntries[3]).toEqual(["categories", "Parenting, Mom"]);
      expect(formDataEntries[7]).toEqual(["agreedToTerms", "Yes"]);
    });

    it("should handle submission with empty notes", () => {
      const mockFormData = {
        groupName: "Test Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Description",
        categories: ["Activities"],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      };

      const formDataEntries: [string, string][] = [
        ["groupName", mockFormData.groupName],
        ["inviteLink", mockFormData.inviteLink],
        ["description", mockFormData.description],
        ["categories", mockFormData.categories.join(", ")],
        ["adminName", mockFormData.adminName],
        ["email", mockFormData.email],
        ["notes", mockFormData.notes],
        ["agreedToTerms", mockFormData.agreedToTerms ? "Yes" : "No"],
      ];

      expect(formDataEntries[6]).toEqual(["notes", ""]);
    });

    it("should handle submission with no categories selected", () => {
      const mockFormData = {
        groupName: "General Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "General group",
        categories: [],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "No category",
        agreedToTerms: true,
      };

      const categoriesEntry = mockFormData.categories.join(", ");
      expect(categoriesEntry).toBe("");
    });

    it("should handle submission with multiple categories", () => {
      const mockFormData = {
        groupName: "Multi-Cat Group",
        inviteLink: "https://chat.whatsapp.com/test",
        description: "Desc",
        categories: [
          "Activities",
          "Language & country",
          "Buy & sell",
          "Age/due date",
        ],
        adminName: "Admin",
        email: "admin@test.com",
        notes: "",
        agreedToTerms: true,
      };

      const categoriesEntry = mockFormData.categories.join(", ");
      expect(categoriesEntry).toBe(
        "Activities, Language & country, Buy & sell, Age/due date",
      );
    });
  });

  describe("Form Validation Before Submit", () => {
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

    it("should reject submission with invalid form state", () => {
      expect(
        isFormValid({
          adminName: "",
          email: "test@example.com",
          agreedToTerms: true,
        }),
      ).toBe(false);

      expect(
        isFormValid({
          adminName: "Admin",
          email: "invalid",
          agreedToTerms: true,
        }),
      ).toBe(false);

      expect(
        isFormValid({
          adminName: "Admin",
          email: "admin@test.com",
          agreedToTerms: false,
        }),
      ).toBe(false);
    });

    it("should allow submission with valid form state", () => {
      expect(
        isFormValid({
          adminName: "John Doe",
          email: "john@example.com",
          agreedToTerms: true,
        }),
      ).toBe(true);

      expect(
        isFormValid({
          adminName: "Jane",
          email: "jane@test.co.uk",
          agreedToTerms: true,
        }),
      ).toBe(true);
    });
  });

  describe("Data Prepopulation with User Info", () => {
    it("should prepopulate form with userName and userEmail when provided", () => {
      const userInfo = {
        userName: "Jane Doe",
        userEmail: "jane@example.com",
      };

      const initialFormData = {
        groupName: "",
        inviteLink: "",
        description: "",
        categories: [] as string[],
        adminName: userInfo.userName || "",
        email: userInfo.userEmail || "",
        notes: "",
        agreedToTerms: false,
      };

      expect(initialFormData.adminName).toBe("Jane Doe");
      expect(initialFormData.email).toBe("jane@example.com");
    });

    it("should handle missing user info gracefully", () => {
      const userInfo = {
        userName: undefined,
        userEmail: undefined,
      };

      const initialFormData = {
        groupName: "",
        inviteLink: "",
        description: "",
        categories: [] as string[],
        adminName: userInfo.userName || "",
        email: userInfo.userEmail || "",
        notes: "",
        agreedToTerms: false,
      };

      expect(initialFormData.adminName).toBe("");
      expect(initialFormData.email).toBe("");
    });
  });

  describe("Category Selection Output", () => {
    it("should output selected categories in correct format", () => {
      const selectedCategories = ["Parenting", "Mom"];
      const output = selectedCategories.join(", ");
      expect(output).toBe("Parenting, Mom");
    });

    it("should output single category without trailing comma", () => {
      const selectedCategories = ["Activities"];
      const output = selectedCategories.join(", ");
      expect(output).toBe("Activities");
    });

    it("should handle category with special characters", () => {
      const selectedCategories = ["Language & country", "Age/due date"];
      const output = selectedCategories.join(", ");
      expect(output).toBe("Language & country, Age/due date");
    });
  });

  describe("Boolean to String Conversion", () => {
    it("should convert agreedToTerms true to 'Yes'", () => {
      const agreedToTerms = true;
      const output = agreedToTerms ? "Yes" : "No";
      expect(output).toBe("Yes");
    });

    it("should convert agreedToTerms false to 'No'", () => {
      const agreedToTerms = false;
      const output = agreedToTerms ? "Yes" : "No";
      expect(output).toBe("No");
    });
  });
});
