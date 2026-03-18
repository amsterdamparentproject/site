"use client";

import { useSearchParams } from "next/navigation";
import InvalidDirectoryLinkWarning from "@/components/InvalidDirectoryLink";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import AddGroupForm from "@/components/groups-directory/AddGroupForm";

export default function AdminClient() {
  const searchParams = useSearchParams();
  const showWarning = searchParams.get("uid") === "false";

  const [hasStoredUid, sethasStoredUid] = useState<boolean | null>(null);
  useEffect(() => {
    const uid = localStorage.getItem("app_uid");
    const maybeValidUid = !!uid && !showWarning;
    sethasStoredUid(maybeValidUid);
  }, []);

  return (
    <div>
      <div className="mt-6 md:mb-6 mb-3 flex flex-col items-center">
        {showWarning && <InvalidDirectoryLinkWarning />}
        <h2 className="text-xl md:text-3xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-2">
          Amsterdam Parent Groups Directory
        </h2>
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-5xl md:leading-10">
          Manage Groups
        </h1>
      </div>
      <div className="flex justify-center mb-1 md:mb-0">
        {hasStoredUid && (
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
          Are you a group admin? You can manage your own groups in the Amsterdam
          Parent Groups Directory, to reach more local parents who would benefit
          from your community.
        </p>
        <p className="max-w-2xl text-center mb-4">
          <b className="dark:text-brand-goldenrod">
            <b>
              Admins can add new groups as well as edit and claim ownership of
              existing groups
            </b>
            .
          </b>{" "}
          You're responsible for keeping group information in the directory up
          to date, such as replacing regenerated invite links.
        </p>
        <p className="max-w-2xl text-center mb-4">
          Any group changes go through an APP approval process to ensure that
          requests are genuine, which may take a few days. APP may contact you
          if we have any questions or see suspicious activity regarding your
          group on the directory.
        </p>
        <p className="max-w-xl text-center italic text-sm mb-4">
          Please review the{" "}
          <a
            href="#group-requirements"
            className="text-brand-goldenrod hover:text-brand-soft-green"
          >
            requirements
          </a>{" "}
          before submitting. If your group does not meet the requirements, we
          will not add it to the directory.
        </p>
        <div className="w-full max-w-lg my-4">
          <AddGroupForm />
        </div>
        <div className="max-w-lg px-3">
          <h2 className="font-bold text-xl" id="group-requirements">
            Group requirements
          </h2>
          <ol className="list-decimal">
            <li className="mt-4 ml-4">
              <b>Community-led:</b> The group is a space for parents to find
              peer-to-peer connection. Your group should be free to join,
              informal in nature, and focused on bringing people together.
            </li>
            <li className="mt-4 ml-4">
              <b>Non-commercial:</b> To maintain the safety and spirit of the
              project, groups created for the purpose of selling products,
              promoting paid services, or generating monetary gain for the admin
              cannot be listed.
            </li>
            <li className="mt-4 ml-4">
              <b>Centered on Amsterdam:</b> Groups should be serving local
              parents in Amsterdam or surrounding locations (e.g. Amstelveen).
            </li>
          </ol>
        </div>
        <div>
          <p className="max-w-xl text-center italic text-sm mt-2">
            A note on APP's role: APP manages the directory, but not the groups
            themselves. We are not responsible for conversations that happen in
            individual chats; we encourage members to reach out directly to
            group admins with questions and concerns. A huge thank you to the
            community admins who moderate the chats! ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
