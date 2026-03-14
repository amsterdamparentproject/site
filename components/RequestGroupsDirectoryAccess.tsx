"use client";
import { useState } from "react";
import { postRequestDirectory } from "./PostToWebhook";
import subscribeToNewsletter from "./Subscribe";

const RequestWhatsAppDirectoryAccess = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interests: [] as string[],
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

  const interestOptions = [
    "Parenting groups",
    "Baby groups",
    "Toddler groups",
    "Child groups",
    "LGBTQ+ family groups",
    "Mom groups",
    "Dad groups",
    "Twin groups",
    "Event & meet-up groups",
    "Entrepreneur & working mom groups",
    "Buy & sell groups",
    "Language & country groups",
    "Groups by age/due date",
    "Groups by neighborhood",
    "Fertility support groups",
    "Pumping support groups",
  ];

  const isAllSelected = formData.interests.length === interestOptions.length;
  const isAnySelected = formData.interests.length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isFormValid =
    formData.name.trim() !== "" && isEmailValid && formData.agreedToTerms;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "interests") {
        const updatedInterests = checkbox.checked
          ? [...formData.interests, value]
          : formData.interests.filter((i) => i !== value);
        setFormData((prev) => ({ ...prev, interests: updatedInterests }));
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
      interests: isAllSelected ? [] : [...interestOptions],
    }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    // INTERESTS
    let selectedInterests = formData.interests.join(", ");
    if (!isAnySelected && !formData.otherInterest.trim()) {
      // Select all if none provided
      selectedInterests = "";
    }

    try {
      // Subscribe to newsletter
      if (formData.subscribeNewsletter) {
        await subscribeToNewsletter({
          email: formData.email,
          tag: "website-whatsapp-directory-request",
          referringSite: String(window.location),
        });
      }

      // Send to n8n
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("interests", selectedInterests);
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
    `bg-brand-soft-green text-brand-white text-lg mt-2 px-6 py-2 rounded transition-all hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
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

      {/* Resources list */}
      <div className="flex flex-wrap mb-6 px-3">
        <label htmlFor="interests-check" className={labelStyle}>
          Which groups are you interested in?
        </label>
        <p className="text-xs text-gray-500 mb-3 italic">
          If none are selected, we'll show you all groups by default.
        </p>
        <div id="interests-check" className="w-full space-y-2">
          <label className="flex items-center p-2 mb-2 bg-brand-sand/10 rounded-md cursor-pointer hover:bg-brand-sand/20 transition-colors">
            <input
              type="checkbox"
              onChange={handleToggleAll}
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isAnySelected && !isAllSelected;
              }}
              className="w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
            />
            <span className="ml-3 font-semibold text-brand-charcoal dark:text-brand-white">
              {isAllSelected ? "Deselect all" : "Select all"}
            </span>
          </label>
          {interestOptions.map((option) => (
            <label
              key={option}
              className="flex items-center cursor-pointer group px-2"
            >
              <input
                type="checkbox"
                name="interests"
                value={option}
                checked={formData.interests.includes(option)}
                onChange={handleChange}
                className="w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
              />
              <span className="ml-3 text-brand-charcoal dark:text-brand-white group-hover:text-brand-soft-green transition-colors">
                {option}
              </span>
            </label>
          ))}
          <div className="flex items-center mt-2 px-2">
            <span className="text-brand-charcoal dark:text-brand-white mr-2">
              Other:
            </span>
            <input
              type="text"
              name="otherInterest"
              value={formData.otherInterest}
              onChange={handleChange}
              placeholder="Please specify"
              className={getStyle("other")}
            />
          </div>
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
            parents shared in the WhatsApp groups
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

export default RequestWhatsAppDirectoryAccess;
