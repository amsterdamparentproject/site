"use client";

import RequestAccessForm from "@/components/groups-directory/RequestAccessForm";
import SharePageBlock from "@/components/SharePageBlock";
import { useSearchParams } from "next/navigation";
import InvalidDirectoryLinkWarning from "@/components/InvalidDirectoryLink";
import Link from "@/components/Link";
import { useEffect, useState } from "react";

export default function AccessClient() {
  const searchParams = useSearchParams();
  const showWarning = searchParams.get("badUid") === "true";

  const [hasStoredUid, sethasStoredUid] = useState<boolean | null>(null);
  useEffect(() => {
    const uid = localStorage.getItem("app_uid");
    const maybeValidUid = !!uid && !showWarning;
    sethasStoredUid(maybeValidUid);
  }, [showWarning]);

  return (
    <div>
      <div className="mt-6 md:mb-6 mb-3 flex flex-col items-center">
        {showWarning && <InvalidDirectoryLinkWarning />}
        <h2 className="text-xl md:text-3xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-2">
          Find your
        </h2>
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-5xl md:leading-10">
          Amsterdam Parent Groups
        </h1>
      </div>
      <div className="flex justify-center mb-1 md:mb-0">
        {hasStoredUid && !showWarning && (
          <Link
            href="/groups-directory"
            className="group inline-flex items-center italic py-2 px-4 rounded-2xl text-lg font-medium text-brand-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod transition-colors"
            prefetch={false}
          >
            Go to directory
            <span className="ml-1 transform group-hover:translate-x-2 transition-transform">
              &rarr;
            </span>
          </Link>
        )}
      </div>
      <div className="flex flex-col items-center space-y-2 md:pt-4 pb-8 md:space-y-5">
        <p className="max-w-2xl text-center mb-4">
          Did you know there's a huge, thriving community of 1000+ Amsterdam
          parents(-to-be) on WhatsApp, Facebook, and other platforms? There are
          groups by neighborhood and age; groups to buy/sell children's items;
          groups for just moms or dads; and more!
        </p>
        <p className="max-w-2xl text-center mb-4">
          <b className="dark:text-brand-goldenrod">
            This form will give you access to the Amsterdam Parent Groups
            Directory,
          </b>{" "}
          with invite links to the online groups. It exists to keep the
          community free of spammers and unwanted promotions. Your information
          will only be used to confirm requests.
        </p>
        <p className="max-w-2xl text-center mb-4">
          After you submit the form,{" "}
          <b className="dark:text-brand-goldenrod">
            you will receive the directory link via email
          </b>
          .{" "}
          <span className="text-brand-violet italic font-bold">
            Please don’t publicly share links to groups or to the directory once
            you have access.
          </span>{" "}
          It's how we keep things safe! If you see someone asking, send them
          this page instead.
        </p>
        <div>
          <SharePageBlock infoText="Invite others to the directory:" />
        </div>

        <div className="w-full max-w-lg my-4">
          <RequestAccessForm />
        </div>
        <div>
          <p className="max-w-xl text-center italic text-sm">
            A note on APP's role: APP collaborates with community admins and
            manages the directory, but not the groups themselves. We are not
            responsible for conversations that happen in individual chats;
            please reach out to the specific group admins with questions and
            concerns. A huge thank you to the community admins who moderate the
            chats! ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
