"use client";
import { useState, useRef } from "react";
import { postEvent } from "./PostToWebhook";

const SubmitEventForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    email: "",
    notes: "",
  });

  const [touched, setTouched] = useState({
    title: false,
    url: false,
    email: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isFormValid =
    formData.title.trim() !== "" && formData.url.trim() !== "" && isEmailValid;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB safe limit

    if (file) {
      if (file.size > MAX_SIZE) {
        setFileError(
          "This image is too large. Please select an image under 4.5MB.",
        );
        // Clear the input so a bad file isn't sitting in the ref
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setFileError(""); // Clear error if file is okay
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resetForm = () => {
    setFormData({ title: "", url: "", email: "", notes: "" });
    setTouched({ title: false, url: false, email: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsSuccess(false);
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    if (!isFormValid || fileError) return;
    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("url", formData.url);
    data.append("email", formData.email);
    data.append("notes", formData.notes);

    if (fileInputRef.current?.files?.[0]) {
      data.append("image", fileInputRef.current.files[0]);
    }

    try {
      const response = await postEvent(data);
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      alert(
        "Something went wrong, please try again. If the error persists, please reach out to us at amsterdamparentproject@gmail.com with the event details.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase =
    `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-500 border rounded py-3 px-4 leading-tight focus:bg-white ` +
    focusStyle;
  const inputStyle = `${inputBase} border-brand-sand`;
  const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30`;
  const submitButtonStyle =
    `bg-brand-soft-green text-brand-white text-lg mt-2 px-6 py-2 rounded transition-all hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
    focusStyle;
  const fileInputStyle =
    `w-full max-w-full appearance-none block bg-white text-brand-charcoal border border-brand-sand rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-brand-goldenrod file:text-brand-charcoal hover:file:bg-brand-goldenrod hover:file:text-brand-charcoal ` +
    focusStyle;

  const getStyle = (field) => {
    // Warn if inputs are invalid
    if (!touched[field]) return inputStyle;
    if (!formData[field].trim()) return requiredInputStyle;
    if (field === "email" && !isEmailValid) return requiredInputStyle;

    return inputStyle;
  };

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green/10 border-2 border-brand-soft-green rounded-lg mb-4">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-2">
          Success!
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-4">
          Your event has been sent for review.
        </p>
        <button onClick={resetForm} className={submitButtonStyle}>
          Submit another event
        </button>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={submitEvent}>
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="title">
            Title of your event <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            className={getStyle("title")}
            id="title"
            name="title"
            type="text"
            placeholder="Parent & child yoga"
            value={formData.title}
            onChange={handleChange}
            onBlur={() => handleBlur("title")}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="url">
            Link to your event <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            className={getStyle("url")}
            id="url"
            name="url"
            type="text"
            placeholder="https://amsterdamparentproject.nl"
            value={formData.url}
            onChange={handleChange}
            onBlur={() => handleBlur("url")}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label htmlFor="event-image" className={labelStyle}>
            Upload event image
          </label>
          <input
            className={fileInputStyle}
            type="file"
            id="event-image"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {fileError && (
            <p className="mt-2 text-red-500 text-[11px]">{fileError}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="notes">
            Anything else to add?
          </label>
          <textarea
            className={inputStyle}
            id="notes"
            name="notes"
            rows={3}
            placeholder="Share details, questions, or comments"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="email">
            Your email <span className="text-red-500 ml-1">*</span>
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
          <p className="mt-2 text-gray-500 text-[11px] italic">
            For confirmation and follow-up questions
          </p>
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <button
            className={submitButtonStyle}
            type="submit"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit event"}
          </button>
          {!isFormValid && !isSubmitting && (
            <p className="mt-2 text-red-500 text-xs">
              Please fill out all required fields correctly
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default SubmitEventForm;
