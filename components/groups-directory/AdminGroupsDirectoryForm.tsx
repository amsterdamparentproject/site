"use client";
import { useEffect, useMemo, useState } from "react";
import { postManageDirectory, postRequestDirectory } from "../PostToWebhook";
import CategoryChipsFormField from "./CategoryChipsFormField";
import {
  AddFormInfo,
  AdminGroupsDirectoryFormProps,
  EditFormInfo,
} from "@/app/types/groups-directory";

const REQUIRED_FIELDS = ["groupName", "inviteLink"];
const REQUIRED_ADMIN_FIELDS = ["email"];
const DESCRIPTION_MAX_LENGTH = 500;

const getFieldLabel = (fieldName: string) => {
  const baseLabels: Record<string, string | { add: string; edit: string }> = {
    groupName: "Group name",
    inviteLink: "Group link",
    description: "Group description",
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
  const [storedUid, setStoredUid] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("app_uid");
    if (!uid || ["false", "null", "undefined"].includes(uid) || !uid.trim()) return;
    setStoredUid(uid);
  }, []);

  // Explicit userId from info (authenticated directory) or fall back to localStorage
  const explicitUserId = "userId" in info ? info.userId : undefined;

  // Hide name/email when we have explicit user info or a stored UID
  const hasIdentity =
    ("userName" in info &&
      "userEmail" in info &&
      !!info.userName &&
      !!info.userEmail) ||
    !!storedUid ||
    !!explicitUserId;

  const [formData, setFormData] = useState(() => {
    if (mode === "edit") {
      const editInfo = info as EditFormInfo;
      return {
        groupName: editInfo.name,
        inviteLink: editInfo.link || "",
        description: editInfo.description,
        categories: editInfo.categories
          ? editInfo.categories.split(", ")
          : ([] as string[]),
        email: editInfo.userEmail || "",
        notes: "",
        isAdmin: false,
      };
    } else {
      const addInfo = info as AddFormInfo;
      return {
        groupName: "",
        inviteLink: "",
        description: "",
        categories: [] as string[],
        email: addInfo.userEmail || "",
        notes: "",
        isAdmin: false,
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
      if (addInfo.userEmail) {
        setFormData((prev) => ({
          ...prev,
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
      hasIdentity ||
      (REQUIRED_ADMIN_FIELDS.every(
        (field) =>
          formData[field as keyof typeof formData]?.toString().trim() !== "",
      ) &&
        isEmailValid);
    return textFieldsValid && adminFieldsValid;
  }, [formData, isEmailValid, hasIdentity]);

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
      data.append("email", formData.email);
      data.append("notes", formData.notes);
      data.append("isAdmin", formData.isAdmin ? "Yes" : "No");

      // Sign them up for the directory if they don't have an account
      data.append(
        "subscribeNewsletter",
        formData.subscribeNewsletter ? "Yes" : "No",
      );

      const response = await postManageDirectory(
        data,
        mode === "add" ? "add" : "update",
      );

      if (response.success) {
        if (response.userCreated) {
          const accessData = new FormData();
          accessData.append("name", "");
          accessData.append("email", formData.email);
          accessData.append("categories", "");
          accessData.append("otherInterest", "");
          accessData.append("notes", "");
          accessData.append("subscribeNewsletter", "No");
          accessData.append("agreedToTerms", "Yes");
          postRequestDirectory(accessData);
        }
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
      (!formData[field].trim() || (field === "email" && !isEmailValid))
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

      {/* Person info */}

      {!hasIdentity && (
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
            <p className="mt-1.5 text-xs text-gray-400 dark:text-brand-white/60">
              To confirm you're not a robot 🤖
            </p>
          </div>
        </div>
      )}

      {/* Admin flag */}
      <div className="flex flex-wrap mb-6 px-3">
        <label
          htmlFor="isAdmin-check"
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="relative">
            <input
              id="isAdmin-check"
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-10 h-6 rounded-full bg-brand-sand peer-checked:bg-brand-soft-green transition-colors" />
            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-brand-charcoal dark:text-brand-white">
            I'm the group admin
          </span>
        </label>
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <div className="flex justify-between items-baseline w-full mb-2">
          <label className={labelStyle.replace(" mb-2", "")} htmlFor="description">
            {formatFieldLabel("description")}
          </label>
          <span
            className={`text-xs ${(formData.description?.length ?? 0) >= DESCRIPTION_MAX_LENGTH ? "text-red-500 font-semibold" : "text-gray-400"}`}
          >
            {formData.description?.length ?? 0}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          className={inputStyle}
          id="description"
          name="description"
          rows={3}
          placeholder="What is your group about?"
          maxLength={DESCRIPTION_MAX_LENGTH}
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
            It is required to fill in the name, link
            {!hasIdentity && ", and email"} to submit.
          </div>
        )}
        <p className="mt-3 text-xs text-gray-400 dark:text-brand-white/60 italic">
          By submitting, you agree to be listed as a group contact for any
          questions.
        </p>
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
