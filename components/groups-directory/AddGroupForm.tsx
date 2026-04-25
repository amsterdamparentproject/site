"use client";
import { useState, useEffect } from "react";
import { postManageDirectory } from "../PostToWebhook";
import subscribeToNewsletter from "../Subscribe";

interface UserInfo {
  name: string;
  email: string;
}

interface AddGroupFormProps {
  userInfo?: UserInfo;
}

const AddGroupForm = ({ userInfo }: AddGroupFormProps) => {
  const [formData, setFormData] = useState({
    groupName: "",
    inviteLink: "",
    description: "",
    adminName: "",
    email: "",
    categories: [] as string[],
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

  // Prepopulate form with user info when available
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        adminName: userInfo.name || prev.adminName,
        email: userInfo.email || prev.email,
      }));
    }
  }, [userInfo]);

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

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    console.log(formData);

    // categories
    const selectedCategories = formData.categories.join(", ");

    try {
      // Subscribe to newsletter
      if (formData.subscribeNewsletter) {
        await subscribeToNewsletter({
          email: formData.email,
          tag: "website-groups-directory-add-group",
          referringSite: String(window.location),
        });
      }

      // Send to n8n
      const data = new FormData();
      data.append("groupName", formData.groupName);
      data.append("inviteLink", formData.inviteLink);
      data.append("description", formData.description);
      data.append("categories", selectedCategories);
      data.append("adminName", formData.adminName);
      data.append("email", formData.email);
      data.append("notes", formData.notes);
      data.append(
        "subscribeNewsletter",
        formData.subscribeNewsletter ? "Yes" : "No",
      );
      data.append("agreedToTerms", formData.agreedToTerms ? "Yes" : "No");

      const response = await postManageDirectory(data);
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
    `bg-brand-soft-green text-brand-white text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
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
          Your request to add a new group has been sent for review. You'll
          receive an email after we've taken a look!
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={submitEvent}>
      <h1 className="text-2xl text-center font-bold text-brand-soft-green mb-5">
        Add a group
      </h1>
      {/* Group info */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="groupName">
            Group name <span className="text-red-500">*</span>
          </label>
          <input
            className={getStyle("groupName")}
            id="groupName"
            name="groupName"
            type="groupName"
            placeholder="Amsterdam Parent Group"
            value={formData.groupName}
            onChange={handleChange}
            onBlur={() => handleBlur("groupName")}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="inviteLink">
            Invite link <span className="text-red-500">*</span>
          </label>
          <input
            className={getStyle("inviteLink")}
            id="inviteLink"
            name="inviteLink"
            type="inviteLink"
            placeholder="https://chat.whatsapp.com/KniW..."
            value={formData.inviteLink}
            onChange={handleChange}
            onBlur={() => handleBlur("inviteLink")}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle} htmlFor="description">
          Description
        </label>
        <textarea
          className={inputStyle}
          id="description"
          name="description"
          rows={3}
          placeholder="What is your group about?"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <label htmlFor="categories-check" className={labelStyle}>
          Which categories apply to your group?
        </label>
        <p className="text-xs text-gray-500 mb-3 italic">
          Select all that apply. If none apply, we will show your group in the
          general list.
        </p>
        <div id="categories-check" className="w-full space-y-2">
          {categories.map((option) => (
            <label
              key={option}
              className="flex items-center cursor-pointer group px-2"
            >
              <input
                type="checkbox"
                name="categories"
                value={option}
                checked={formData.categories.includes(option)}
                onChange={handleChange}
                className="w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
              />
              <span className="ml-3 text-brand-charcoal dark:text-brand-white group-hover:text-brand-soft-green transition-colors">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Person info */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="adminName">
            Your first name <span className="text-red-500">*</span>
          </label>
          <input
            className={getStyle("adminName")}
            id="adminName"
            name="adminName"
            type="adminName"
            placeholder="Alex"
            value={formData.adminName}
            onChange={handleChange}
            onBlur={() => handleBlur("adminName")}
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
            <b>
              I confirm that this group meets directory requirements and that I
              am the owner/admin of this group.
            </b>{" "}
            I agree to proactively keep the group information up to date in the
            directory and to be the "admin contact" if there are questions or
            concerns regarding the group.{" "}
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
          {isSubmitting ? "Sending..." : "Add group"}
        </button>
      </div>
    </form>
  );
};

export default AddGroupForm;
