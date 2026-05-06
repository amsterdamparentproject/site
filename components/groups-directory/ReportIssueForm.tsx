"use client";
import { useState } from "react";
import { postManageDirectory } from "../PostToWebhook";
import { ReportFormInfo } from "@/app/types/groups-directory";

type IssueType = "link" | "other";

const ReportIssueForm = ({
  info,
  onClose,
}: {
  info: ReportFormInfo;
  onClose?: () => void;
}) => {
  const [issueType, setIssueType] = useState<IssueType>("link");
  const [newInviteLink, setNewInviteLink] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isFormValid = issueType === "link" || explanation.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("groupName", info.name);
      data.append("issue", issueType);
      data.append("originalInviteLink", info.link);
      data.append(
        "newInviteLink",
        issueType === "link" ? newInviteLink.trim() : "",
      );
      data.append("notes", issueType === "other" ? explanation.trim() : "");

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
      {/* Radio buttons */}
      <div className="flex flex-col gap-2 mb-6 px-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="issueType"
            value="link"
            checked={issueType === "link"}
            onChange={() => setIssueType("link")}
            className="w-4 h-4 accent-brand-soft-green cursor-pointer"
          />
          <span className="text-md font-bold text-brand-charcoal dark:text-brand-white">
            Broken link
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="issueType"
            value="other"
            checked={issueType === "other"}
            onChange={() => setIssueType("other")}
            className="w-4 h-4 accent-brand-soft-green cursor-pointer"
          />
          <span className="text-md font-bold text-brand-charcoal dark:text-brand-white">
            Other issue
          </span>
        </label>
      </div>

      {/* Dynamic field */}
      <div className="flex flex-wrap mb-6 px-3">
        {issueType === "link" ? (
          <>
            <label className={labelStyle + " w-full"} htmlFor="newInviteLink">
              New invite link{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={inputStyle}
              id="newInviteLink"
              type="text"
              placeholder="https://chat.whatsapp.com/..."
              value={newInviteLink}
              onChange={(e) => setNewInviteLink(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-brand-white/60">
              If you know the new link, sharing it helps us fix this faster!
            </p>
          </>
        ) : (
          <>
            <label className={labelStyle + " w-full"} htmlFor="explanation">
              Explain the issue
              <span className="pl-1 text-red-500">*</span>
            </label>
            <textarea
              className={inputStyle}
              id="explanation"
              rows={3}
              placeholder="Describe the issue..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </>
        )}
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
            Please describe the issue.
          </div>
        )}
      </div>
    </form>
  );
};

export default ReportIssueForm;
