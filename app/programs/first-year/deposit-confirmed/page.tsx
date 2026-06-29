import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({
  title: "Got it — thanks!",
  robots: { index: false, follow: false },
});

const MESSAGES = {
  credit: {
    heading: "You're on for September",
    body: "I've noted your deposit for the First Year Program September cohort. No further action needed — I'll be in touch with details as we get closer.",
  },
  refund: {
    heading: "Refund on its way",
    body: "No problem at all. I'll issue your refund shortly and you'll see it back within a few business days.",
  },
  expired: {
    heading: "This link has expired",
    body: "Please reply directly to the email and let me know what you'd like to do — I'm happy to help.",
  },
  invalid: {
    heading: "Something went wrong",
    body: "This link doesn't look right. Please reply directly to the email and I'll sort it out.",
  },
  server: {
    heading: "Something went wrong",
    body: "There was an error on our end. Please reply directly to the email and I'll sort it out.",
  },
};

export default async function DepositConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; error?: string; already?: string }>;
}) {
  const params = await searchParams;
  const key =
    (params.error as keyof typeof MESSAGES) ??
    (params.action as keyof typeof MESSAGES) ??
    "invalid";

  const { heading, body } = MESSAGES[key] ?? MESSAGES.invalid;
  const alreadyResponded = params.already === "true";

  return (
    <div className="flex-column justify-center mx-2">
      <div className="pt-6 pb-6 flex flex-col items-center">
        <div className="flex flex-col text-center items-center space-y-4 pt-6 max-w-xl">
          {alreadyResponded && (
            <p className="text-sm text-gray-500">
              (Looks like you already responded — just confirming below.)
            </p>
          )}
          <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:text-5xl dark:text-gray-100">
            {heading}
          </h1>
          <p className="mt-4">{body}</p>
          <p className="text-sm text-gray-500 mt-2">
            — Alex, Amsterdam Parent Project
          </p>
        </div>
      </div>
    </div>
  );
}
