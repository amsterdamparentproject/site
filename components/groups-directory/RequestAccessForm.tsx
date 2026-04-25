"use client";
import { useState } from "react";
import { postRequestDirectory } from "../PostToWebhook";
import subscribeToNewsletter from "../Subscribe";
import CategoryChipsFormField from "./CategoryChipsFormField";

const RequestAccessForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    categories: [] as string[],
    otherInterest: "",
    notes: "",
    subscribeNewsletter: false,
    agreedToTerms: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    other: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
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

  const isAllSelected = formData.categories.length === categories.length;
  const isAnySelected = formData.categories.length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isFormValid =
    formData.name.trim() !== "" && isEmailValid && formData.agreedToTerms;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "categories") {
        const updatedCategories = checkbox.checked
          ? [...formData.categories, value]
          : formData.categories.filter((i) => i !== value);
        setFormData((prev) => ({ ...prev, categories: updatedCategories }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleAll = () => {
    setFormData((prev) => ({
      ...prev,
      categories: isAllSelected ? [] : [...categories],
    }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    // categories
    let selectedCategories = formData.categories.join(", ");
    if (!isAnySelected && !formData.otherInterest.trim()) {
      // Select all if none provided
      selectedCategories = "";
    }

    try {
      // Subscribe to newsletter
      if (formData.subscribeNewsletter) {
        await subscribeToNewsletter({
          email: formData.email,
          tag: "website-groups-directory-request",
          referringSite: String(window.location),
        });
      }

      // Send to n8n
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("categories", selectedCategories);
      data.append("otherInterest", formData.otherInterest);
      data.append("notes", formData.notes);
      data.append(
        "subscribeNewsletter",
        formData.subscribeNewsletter ? "Yes" : "No",
      );
      data.append("agreedToTerms", formData.agreedToTerms ? "Yes" : "No");

      const response = await postRequestDirectory(data);
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      alert(
        "Something went wrong. Please contact hello@amsterdamparentproject.nl.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase =
    `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-500 border rounded py-3 px-4 leading-tight focus:bg-white ` +
    focusStyle;
  const inputStyle = `${inputBase} border-brand-sand`;
  const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30`;
  const submitButtonStyle =
    `bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal font-bold text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
    focusStyle;

  const getStyle = (field: string) => {
    if (!touched[field]) return inputStyle;
    if (field === "email" && !isEmailValid) return requiredInputStyle;
    if (field === "name" && !formData.name.trim()) return requiredInputStyle;
    return inputStyle;
  };

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl mb-4">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          Success!
        </h2>
        <p className="text-brand-white">
          Your request has been sent for review. Once approved, you'll receive
          an email with the directory link.
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={submitEvent}>
      {/* Person info */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="name">
            Your first name <span className="text-red-500">*</span>
          </label>
          <input
            className={getStyle("name")}
            id="name"
            name="name"
            type="name"
            placeholder="Alex"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur("name")}
          />
        </div>
      </div>
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="email">
            Your email <span className="text-red-500">*</span>
          </label>
          <input
            className={getStyle("email")}
            id="email"
            name="email"
            type="email"
            placeholder="hello@amsterdamparentproject.nl"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
          />
        </div>
      </div>

      <CategoryChipsFormField
        selectedCategories={formData.categories}
        formQuestion="Which groups are you interested in?"
        formQuestionDescription="If none are selected, we'll show you all groups by default."
        onChange={(categories) =>
          setFormData((prev) => ({ ...prev, categories }))
        }
      />

      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle} htmlFor="notes">
          Anything else to add?
        </label>
        <textarea
          className={inputStyle}
          id="notes"
          name="notes"
          rows={3}
          placeholder="Share details..."
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      {/* Newsletter subscription */}
      <div className="flex flex-wrap mb-4 px-3">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            name="subscribeNewsletter"
            checked={formData.subscribeNewsletter}
            onChange={handleChange}
            className="w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
          />
          <span className="ml-3 text-sm text-brand-charcoal dark:text-brand-white">
            <b>Please subscribe me to APP's newsletter</b>: a twice-monthly
            email digest of upcoming activities for babies, toddlers, and
            parents shared in the groups.
          </span>
        </label>
      </div>

      {/* Agreement */}
      <div className="flex flex-wrap mb-6 px-3">
        <label
          htmlFor="agreement-check"
          className="flex items-start cursor-pointer group"
        >
          <input
            id="agreement-check"
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            className="mt-1 w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
          />
          <span className="ml-3 text-sm text-brand-charcoal dark:text-brand-white">
            <b>I agree to not publicly share links</b> to groups or to the
            directory once I have access, to keep the community safe from
            spammers. (Please share this form instead!){" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Request access"}
        </button>
      </div>
    </form>
  );
};

export default RequestAccessForm;
