"use client";

import siteMetadata from "@/data/siteMetadata";

const SubmitEventForm = () => {
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus:ring-0 focus:border-brand-violet focus:border-2`;
  const inputStyle =
    `
    form-required
    appearance-none block w-full 
    bg-white/70 text-charcoal placeholder-gray-500 
    border border-brand-sand 
    rounded py-3 px-4 leading-tight 
    focus:bg-white ` + focusStyle;
  const requiredInputStyle =
    `
    appearance-none block w-full 
    bg-white/70 text-charcoal placeholder-gray-500 
    border border-red-500 
    rounded py-3 px-4 leading-tight 
    focus:bg-white ` + focusStyle;
  const submitButtonStyle =
    `
    bg-brand-goldenrod text-lg 
    mt-2 px-3 py-2 rounded 
    hover:cursor-pointer ` + focusStyle;
  const fileInputStyle =
    `
    form-input 
    border-brand-sand
    rounded
    hover:cursor-pointer
    file:mr-2 file:py-1 file:px-3 file:border-[1px]
    file:text-sm file:font-medium
    file:bg-brand-soft-green file:text-brand-white file:rounded
    hover:file:cursor-pointer hover:file:bg-brand-goldenrod hover:file:text-brand-charcoal ` +
    focusStyle;

  if (siteMetadata.newsletter?.provider) {
    return (
      <form className="w-100%">
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="grid-url">
              Title of your event
            </label>
            <input
              className={inputStyle}
              id="grid-url"
              type="text"
              placeholder="Young child reading circle"
            />
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="grid-url">
              Link to your event
            </label>
            <input
              className={inputStyle}
              id="grid-url"
              type="text"
              placeholder="https://amsterdamparentproject.nl"
            />
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label htmlFor="event-image" className={labelStyle}>
              Upload event image (optional)
            </label>
            <input
              className={fileInputStyle}
              type="file"
              id="event-image"
              name="Event image"
              accept=""
              placeholder=""
            />
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="grid-url">
              Anything else to add? (optional)
            </label>
            <textarea
              className={inputStyle}
              id="grid-url"
              placeholder="Share details, questions, or comments"
            />
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <label className={labelStyle} htmlFor="grid-url">
              Your email
            </label>
            <input
              className={inputStyle}
              id="grid-url"
              type="email"
              placeholder="hello@amsterdamparentproject.nl"
            />
            <p className="mt-2 text-gray-500 text-xs italic">
              We ask for your email to limit spam and also to reach out with
              questions.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full px-3">
            <input
              className={submitButtonStyle}
              type="submit"
              value="Submit event"
            />
            <p className="mt-2 text-red-500 text-xs">
              Please fill out all required fields
            </p>
          </div>
        </div>
      </form>
    );
  }
};

export default SubmitEventForm;
