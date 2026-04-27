const InvalidDirectoryLinkWarning = () => {
  return (
    <div className="max-w-md mx-auto my-8 bg-white dark:bg-brand-soft-charcoal border border-brand-sand/60 rounded-lg">
      <div className="p-4 flex items-start gap-4">
        {/* Minimal Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-md font-bold text-brand-charcoal dark:text-brand-white">
            Invalid directory link
          </h3>
          <p className="mt-2 text-sm text-brand-soft-charcoal dark:text-brand-white/70">
            Please <b>use the personal directory link sent to your email</b>, or
            request a new link with the form below. It should only take a minute
            😌
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvalidDirectoryLinkWarning;
