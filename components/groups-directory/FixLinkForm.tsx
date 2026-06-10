"use client";
import { useState } from "react";
import { postManageDirectory } from "../PostToWebhook";
import { ReportFormInfo } from "@/app/types/groups-directory";

const FixLinkForm = ({
  info,
  onClose,
}: {
  info: ReportFormInfo;
  onClose?: () => void;
}) => {
  const [newInviteLink, setNewInviteLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isLinkValid =
    newInviteLink.trim().startsWith("http://") ||
    newInviteLink.trim().startsWith("https://");
  const isFormValid = isLinkValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("groupName", info.name);
      data.append("issue", "link");
      data.append("originalInviteLink", info.link);
      data.append("newInviteLink", newInviteLink.trim());
      data.append("notes", "");

      const response = await postManageDirectory(data, "report");
      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => onClose?.(), 2000);
      } else {
        throw new Error(response.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Fix link error:", error);
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
  const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30 focus:border-red-600`;
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
          We&apos;ve received the new link and will update the directory
          shortly.
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-wrap mb-6 px-3">
        <label className={labelStyle + " w-full"} htmlFor="newInviteLink">
          New invite link <span className="text-red-500">*</span>
        </label>
        <input
          className={
            newInviteLink.trim() !== "" && !isLinkValid
              ? requiredInputStyle
              : inputStyle
          }
          id="newInviteLink"
          type="text"
          placeholder="https://chat.whatsapp.com/..."
          value={newInviteLink}
          onChange={(e) => setNewInviteLink(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-gray-400 dark:text-brand-white/60">
          If you know the new link, sharing it helps us fix this faster!
        </p>
        {newInviteLink.trim() !== "" && !isLinkValid && (
          <p className="mt-1 text-xs text-red-500">
            Please enter a valid URL starting with https://
          </p>
        )}
      </div>

      <div className="flex flex-col mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Fix link"}
        </button>
      </div>
    </form>
  );
};

export default FixLinkForm;
