import { ReactNode } from "react";
import type { Authors, TeamMembers } from "contentlayer/generated";
import SocialIcon from "@/components/social-icons";
import Image from "@/components/Image";

interface Props {
  children: ReactNode;
  content:
    | Omit<Authors, "_id" | "_raw" | "body">
    | Omit<TeamMembers, "_id" | "_raw" | "body">;
}

export default function AuthorLayout({ children, content }: Props) {
  const {
    name,
    avatar,
    occupation,
    company,
    email,
    linkedin,
    github,
    instagram,
    website,
  } = content;

  return (
    <>
      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div className="flex flex-col items-center space-x-2 pt-8">
          {avatar && (
            <Image
              src={avatar}
              alt="avatar"
              width={192}
              height={192}
              className="h-48 w-48 rounded-full"
            />
          )}
          <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">
            {name}
          </h3>
          <div className="text-brand-soft-charcoal dark:text-brand-white">
            {occupation}
          </div>
          <div className="text-brand-soft-charcoal dark:text-brand-white">
            {company}
          </div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="instagram" href={instagram} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
            <SocialIcon kind="website" href={website} />
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-2">
          {children}
        </div>
      </div>
    </>
  );
}
