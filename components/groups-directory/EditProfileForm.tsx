"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryChipsFormField from "./CategoryChipsFormField";
import { updateUserProfile } from "@/app/groups-directory/actions";

interface Props {
  uid: string;
  userName: string;
  userEmail: string;
  userInterests: string[];
  onClose: () => void;
}

export default function EditProfileForm({
  uid,
  userName,
  userEmail,
  userInterests,
  onClose,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [categories, setCategories] = useState<string[]>(userInterests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isEmailValid;

  const focusStyle = `focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase = `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-400/80 border rounded py-3 px-4 leading-tight focus:bg-white ${focusStyle}`;
  const inputStyle = `${inputBase} border-brand-sand`;
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    const result = await updateUserProfile(uid, name, email, categories);
    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1200);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          Updated!
        </h2>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="profile-name">
            First name
          </label>
          <input
            id="profile-name"
            type="text"
            className={inputStyle}
            placeholder="Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="profile-email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-email"
            type="email"
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <CategoryChipsFormField
        selectedCategories={categories}
        onChange={setCategories}
      />

      <div className="flex flex-col px-3 mb-4">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal w-32 font-bold text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ${focusStyle}`}
        >
          {isSubmitting ? "Saving..." : "Update"}
        </button>
      </div>
    </form>
  );
}
