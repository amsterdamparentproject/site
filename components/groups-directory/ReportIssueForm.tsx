"use client";
import { useState } from "react";
import { postManageDirectory } from "../PostToWebhook";
import { ReportFormInfo } from "@/app/types/groups-directory";

const ReportIssueForm = ({
  info,
  onClose,
}: {
  info: ReportFormInfo;
  onClose?: () => void;
}) => {
  const [newInviteLink, setNewInviteLink] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isFormValid = newInviteLink.trim() !== "" || notes.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("groupName", info.name);
      data.append("issue", newInviteLink.trim() !== "" ? "link" : "other");
      data.append("originalInviteLink", info.link);
      data.append("newInviteLink", newInviteLink.trim());
      data.append("notes", notes.trim());

      const response = await postManageDirectory(data, "report");
      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => onClose?.(), 2000);
      } else {
        throw new Error(response.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Report error:", error);
      alert(
        "Something went wrong. Please contact hello@amsterdamparentproject.nl.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase =
    `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-400/80 border rounded py-3 px-4 leading-tight focus:bg-white ` +
    focusStyle;
  const inputStyle = `${inputBase} border-brand-sand`;
  const submitButtonStyle =
    `bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal w-40 font-bold text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
    focusStyle;

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl mb-4">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          Thanks!
        </h2>
        <p className="text-brand-white">
          Your report has been sent. We'll look into it!
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle} htmlFor="newInviteLink">
          New invite link{" "}
        </label>
        <input
          className={inputStyle}
          id="newInviteLink"
          type="text"
          placeholder="https://chat.whatsapp.com/..."
          value={newInviteLink}
          onChange={(e) => setNewInviteLink(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle} htmlFor="notes">
          Other issue{" "}
        </label>
        <textarea
          className={inputStyle}
          id="notes"
          rows={3}
          placeholder="Describe the issue..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-col mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send report"}
        </button>
        {!isFormValid && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 italic">
            Please provide a new invite link or describe the issue.
          </div>
        )}
      </div>
    </form>
  );
};

export default ReportIssueForm;
