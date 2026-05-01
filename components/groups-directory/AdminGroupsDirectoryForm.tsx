"use client";
import { useEffect, useMemo, useState } from "react";
import { postManageDirectory } from "../PostToWebhook";
import CategoryChipsFormField from "./CategoryChipsFormField";
import {
  AddFormInfo,
  AdminGroupsDirectoryFormProps,
  EditFormInfo,
} from "@/app/types/groups-directory";
import subscribeToNewsletter from "../Subscribe";

const REQUIRED_FIELDS = ["groupName", "inviteLink", "acceptedTerms"];
const REQUIRED_ADMIN_FIELDS = ["adminName", "email"];

const getFieldLabel = (fieldName: string) => {
  const baseLabels: Record<string, string | { add: string; edit: string }> = {
    groupName: "Name",
    inviteLink: "Link",
    description: "Description",
    adminName: "Your first name",
    email: "Your email",
    notes: "Anything else to add?",
  };
  return baseLabels[fieldName];
};

const AdminGroupsDirectoryForm = ({
  mode,
  info,
  onClose,
}: AdminGroupsDirectoryFormProps) => {
  // Check if there's existing admin info
  const hasAdminInfo =
    "userName" in info &&
    "userEmail" in info &&
    info.userName &&
    info.userEmail;

  const [formData, setFormData] = useState(() => {
    if (mode === "edit") {
      const editInfo = info as EditFormInfo;
      return {
        groupName: editInfo.name,
        inviteLink: editInfo.link || "", // Pre-fill with existing link for edit mode
        description: editInfo.description,
        categories: editInfo.categories
          ? editInfo.categories.split(", ")
          : ([] as string[]),
        adminName: editInfo.userName || "",
        email: editInfo.userEmail || "",
        notes: "",
        agreedToTerms: false,
      };
    } else {
      const addInfo = info as AddFormInfo;
      return {
        groupName: "",
        inviteLink: "",
        description: "",
        categories: [] as string[],
        adminName: addInfo.userName || "",
        email: addInfo.userEmail || "",
        notes: "",
        agreedToTerms: false,
        // If they're not signed in, offer newsletter subscription option
        subscribeNewsletter: false,
      };
    }
  });

  // Initialize form data when component mounts or info changes (for edit mode)
  useEffect(() => {
    if (mode === "edit") {
      const editInfo = info as EditFormInfo;
      {
        setFormData((prev) => ({
          ...prev,
          groupName: editInfo.name,
          description: editInfo.description,
          categories: editInfo.categories
            ? editInfo.categories.split(", ")
            : [],
        }));
      }
    } else {
      // For add mode, prepopulate user info when available
      const addInfo = info as AddFormInfo;
      if (addInfo.userName) {
        setFormData((prev) => ({
          ...prev,
          adminName: addInfo.userName || prev.adminName,
          email: addInfo.userEmail || prev.email,
        }));
      }
    }
  }, [mode, info]);

  const [showLinkInput, setShowLinkInput] = useState(mode === "add");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if the form is valid
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isFormValid = useMemo(() => {
    const textFieldsValid = REQUIRED_FIELDS.every(
      (field) =>
        formData[field as keyof typeof formData]?.toString().trim() !== "",
    );
    const adminFieldsValid =
      REQUIRED_ADMIN_FIELDS.every(
        (field) =>
          formData[field as keyof typeof formData]?.toString().trim() !== "",
      ) && isEmailValid;
    return textFieldsValid && adminFieldsValid && formData.agreedToTerms;
  }, [formData, isEmailValid]);

  // Add required star
  const formatFieldLabel = (fieldName: string) => {
    const isRequired =
      REQUIRED_FIELDS.includes(fieldName) ||
      REQUIRED_ADMIN_FIELDS.includes(fieldName);
    return (
      <>
        {getFieldLabel(fieldName)}
        {isRequired && <span className="pl-1 text-red-500">*</span>}
      </>
    );
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // This strictly handles text/textarea
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitEvent = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    // categories
    const selectedCategories = formData.categories.join(", ");

    try {
      // Send to n8n
      const data = new FormData();
      if (mode === "edit") {
        data.append("originalGroupName", info.name ?? formData.groupName);
      }
      data.append("groupName", formData.groupName);
      data.append("inviteLink", formData.inviteLink);
      data.append("description", formData.description);
      data.append("categories", selectedCategories);
      data.append("adminName", formData.adminName);
      data.append("email", formData.email);
      data.append("notes", formData.notes);
      data.append("agreedToTerms", formData.agreedToTerms ? "Yes" : "No");

      // Sign them up for the directory if they don't have an account
      data.append("createAccount", hasAdminInfo ? "No" : "Yes");
      data.append(
        "subscribeNewsletter",
        formData.subscribeNewsletter ? "Yes" : "No",
      );

      const response = await postManageDirectory(
        data,
        mode === "add" ? "add" : "update",
      );

      if (response.success) {
        setIsSuccess(true);
        // Close modal/drawer after successful submission
        setTimeout(() => {
          onClose?.();
        }, 2000); // Give user time to see success message
      } else {
        console.error("postManageDirectory response:", response);
        throw new Error(
          `Submission failed: ${response.error || `HTTP ${response.status}`}`,
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        "Something went wrong. Please contact hello@amsterdamparentproject.nl.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit button based on mode
  const submitButtonText = mode === "add" ? "Add group" : "Request changes";
  const submitButtonWidth = mode === "add" ? "w-40" : "w-64";

  // Styles
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase =
    `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-400/80 border rounded py-3 px-4 leading-tight focus:bg-white ` +
    focusStyle;
  const inputStyle = `${inputBase} border-brand-sand`;
  const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30 focus:border-red-600 focus:ring-red-200`;
  const submitButtonStyle =
    `bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal ${submitButtonWidth} font-bold text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
    focusStyle;

  const getStyle = (field: string) => {
    if (!touched[field]) return inputStyle;
    if (
      (REQUIRED_FIELDS.includes(field) ||
        REQUIRED_ADMIN_FIELDS.includes(field)) &&
      !formData[field].trim()
    )
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
      {/* Group info */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="groupName">
            {formatFieldLabel("groupName")}
          </label>
          <input
            className={getStyle("groupName")}
            id="groupName"
            name="groupName"
            type="text"
            value={formData.groupName}
            onChange={handleChange}
            onBlur={() => handleBlur("groupName")}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="inviteLink">
            {formatFieldLabel("inviteLink")}
          </label>
          {mode === "edit" && !showLinkInput ? (
            <div className="flex items-center justify-between p-3 border border-brand-soft-green dark:border-brand-sand rounded bg-brand-soft-green/10 dark:bg-brand-sand/10">
              <span className="text-sm text-gray-500 dark:text-brand-white tracking-wider">
                ••••••••••••••••
              </span>
              <button
                type="button"
                onClick={() => setShowLinkInput(true)}
                className="text-xs font-bold text-brand-soft-green dark:text-brand-goldenrod hover:underline cursor-pointer"
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
          {formatFieldLabel("description")}
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
            <span
              className={`${formData.agreedToTerms ? "text-brand-soft-green" : "text-red-500"} font-bold`}
            >
              I confirm that I am the owner/admin of this group.
            </span>{" "}
            I agree to keep group info up to date in the directory and to be the
            contact for questions or concerns.{" "}
            <span className="text-red-500 font-bold">*</span>
          </span>
        </label>
      </div>

      {/* Person info */}
      {!hasAdminInfo && (
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="adminName">
              {formatFieldLabel("adminName")}
            </label>
            <input
              className={getStyle("adminName")}
              id="adminName"
              name="adminName"
              type="text"
              placeholder="Alex"
              value={formData.adminName}
              onChange={handleChange}
              onBlur={() => handleBlur("adminName")}
            />
          </div>
        </div>
      )}

      {!hasAdminInfo && (
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="email">
              {formatFieldLabel("email")}
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
      )}

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
      {!hasAdminInfo && (
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
      )}

      <div className="flex flex-col mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : submitButtonText}
        </button>
        {!isFormValid && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 italic">
            It is required to fill in the name, link,{" "}
            {!hasAdminInfo && "your contact details, "}and confirm ownership to
            submit.
          </div>
        )}
      </div>
      <p className="px-3 text-sm italic mb-5">
        Any group directory changes go through an APP approval process to ensure
        that requests are genuine, which may take a few days. APP may contact
        you if we have any questions or see suspicious directory activity with
        your group.
      </p>
    </form>
  );
};

export default AdminGroupsDirectoryForm;
