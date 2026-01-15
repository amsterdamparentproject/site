function DownloadFileButton(args) {
  const { filePath, buttonText, umamiName } = args;

  return (
    <a
      href={filePath}
      download
      data-umami-event={umamiName}
      data-umami-type="downloadFileButton"
      className="inline-flex items-center px-6 py-3 bg-brand-soft-green text-base font-medium rounded-md text-brand-white hover:bg-brand-goldenrod cursor:pointer"
    >
      <svg
        className="mr-2 h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d=" household/4 12h16m-7 5l7-7-7-7"
        />
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {buttonText}
    </a>
  );
}

export default DownloadFileButton;
