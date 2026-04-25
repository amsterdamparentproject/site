"use client";
import { useEffect, useState } from "react";
import { postManageDirectory } from "../PostToWebhook";
import CategoryChipsFormField from "./CategoryChipsFormField";

interface FormProps {
  name: string;
  categories: string;
  description: string;
  userName?: string;
  userEmail?: string;
}

const ChangeGroupForm = ({
  info,
  onClose,
}: {
  info: FormProps;
  onClose?: () => void;
}) => {
  const [formData, setFormData] = useState({
    originalGroupName: info.name, // Keep track of original name for reference
    groupName: info.name,
    inviteLink: "", // Deliberately not pre-filling invite link for security reasons, but can be added if desired
    description: info.description,
    categories: info.categories
      ? info.categories.split(", ")
      : ([] as string[]),
    adminName: info.userName || "",
    email: info.userEmail || "",
    notes: "",
    agreedToTerms: false,
  });

  // Initialize form data when component mounts or info changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      groupName: info.name,
      description: info.description,
      categories: info.categories
        ? info.categories.split(", ")
        : ([] as string[]),
    }));
  }, [info]);

  const [showLinkInput, setShowLinkInput] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    other: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    "Parenting",
    "Mom",
    "Dad",
    "Twin",
    "Neighborhood",
    "Age/due date",
    "Activities",
    "Language & country",
    "Buy & sell",
  ];

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isFormValid =
    formData.adminName.trim() !== "" && isEmailValid && formData.agreedToTerms;

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

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submitEvent = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    console.log(formData);

    // categories
    const selectedCategories = formData.categories.join(", ");

    try {
      // Send to n8n
      const data = new FormData();
      data.append("originalGroupName", formData.originalGroupName);
      data.append("groupName", formData.groupName);
      data.append("inviteLink", formData.inviteLink);
      data.append("description", formData.description);
      data.append("categories", selectedCategories);
      data.append("adminName", formData.adminName);
      data.append("email", formData.email);
      data.append("notes", formData.notes);
      data.append("agreedToTerms", formData.agreedToTerms ? "Yes" : "No");

      const response = await postManageDirectory(data, "update");
      if (response.success) {
        setIsSuccess(true);
        // Close modal/drawer after successful submission
        setTimeout(() => {
          onClose?.();
        }, 2000); // Give user time to see success message
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
    if (field === "adminName" && !formData.adminName.trim())
      return requiredInputStyle;
    return inputStyle;
  };

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl mb-4">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          Success!
        </h2>
        <p className="text-brand-white">
          Your request for changes has been sent for review. You'll receive an
          email after we've taken a look!
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={submitEvent}>
      {/* Agreement */}
      <div className="flex flex-wrap mb-6 px-3">
        <label
          htmlFor="agreement-check"
          className="flex items-start cursor-pointer group select-none" // added select-none to prevent accidental text highlighting
        >
          <div className="flex-shrink-0 mt-1">
            <input
              id="agreement-check"
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="w-5 h-5 border-brand-sand rounded accent-brand-soft-green cursor-pointer"
            />
          </div>
          <span className="ml-3 text-sm text-brand-charcoal dark:text-brand-white leading-tight">
            <b>I confirm that I am the owner/admin of this group.</b> I agree to
            keep group info up to date in the directory and to be the contact
            for questions or concerns.{" "}
            <span className="text-red-500 font-bold">*</span>
          </span>
        </label>
      </div>

      {/* Group info */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="groupName">
            Change name
          </label>
          <input
            className={getStyle("groupName")}
            id="groupName"
            name="groupName"
            type="text"
            value={formData.groupName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="inviteLink">
            Change invite link
          </label>
          {!showLinkInput && formData.groupName ? (
            <div className="flex items-center justify-between p-3 border border-brand-soft-green rounded bg-brand-soft-green/10">
              <span className="text-sm text-gray-500 tracking-wider">
                ••••••••••••••••
              </span>
              <button
                type="button"
                onClick={() => setShowLinkInput(true)}
                className="text-xs font-bold text-brand-soft-green hover:underline cursor-pointer"
              >
                Change link
              </button>
            </div>
          ) : (
            <input
              className={getStyle("inviteLink")}
              id="inviteLink"
              name="inviteLink"
              type="text"
              placeholder="https://chat.whatsapp.com/..."
              value={formData.inviteLink}
              onChange={handleChange}
              onBlur={() => handleBlur("inviteLink")}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle} htmlFor="description">
          Change description
        </label>
        <textarea
          className={inputStyle}
          id="description"
          name="description"
          rows={3}
          placeholder="What is your group about?"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>

      <CategoryChipsFormField
        selectedCategories={formData.categories}
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

      <div className="flex flex-wrap mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Request changes"}
        </button>
      </div>
      <p className="px-3 text-sm italic mb-5">
        Any group changes go through an APP approval process to ensure that
        requests are genuine, which may take a few days. APP may contact you if
        we have any questions or see suspicious directory activity with your
        group.
      </p>
    </form>
  );
};

export default ChangeGroupForm;
