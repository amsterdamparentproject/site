import { TeamMembers, allTeamMembers } from "contentlayer/generated";
import { MDXLayoutRenderer } from "pliny/mdx-components";
import AuthorLayout from "@/layouts/AuthorLayout";
import { coreContent } from "pliny/utils/contentlayer";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Team" });

const teamMemberDetails = allTeamMembers.map((author) => {
  return {
    coreContent: coreContent(author as TeamMembers),
    raw: author,
  };
});

export default function Page() {
  const teamMemberDetails = allTeamMembers.map((member) => {
    return {
      coreContent: coreContent(member as TeamMembers),
      raw: member,
    };
  });

  // This is heinous, because 'find' can return undefined. Fix it someday.
  const defaultTeamMember = teamMemberDetails[0];

  const alex = teamMemberDetails.find((p) => p.raw.slug === "alexSiega");
  const alexandra = teamMemberDetails.find(
    (p) => p.raw.slug === "alexandraFallows",
  );
  const miriam = teamMemberDetails.find(
    (p) => p.raw.slug === "irenaDomachowska",
  );
  const heather = teamMemberDetails.find((p) => p.raw.slug === "heatherBerry");

  return (
    <div className="pb-6 flex flex-col items-center">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          The team
        </h1>
      </div>
      <h2 className="text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod">
        Core team
      </h2>
      <div key={alex?.coreContent.name}>
        <AuthorLayout
          content={alex ? alex.coreContent : defaultTeamMember.coreContent}
        >
          <MDXLayoutRenderer
            code={alex ? alex.raw.body.code : defaultTeamMember.raw.body.code}
          />
        </AuthorLayout>
      </div>
      <div key={miriam?.coreContent.name}>
        <AuthorLayout
          content={miriam ? miriam.coreContent : defaultTeamMember.coreContent}
        >
          <MDXLayoutRenderer
            code={
              miriam ? miriam.raw.body.code : defaultTeamMember.raw.body.code
            }
          />
        </AuthorLayout>
      </div>
      <div key={alexandra?.coreContent.name}>
        <AuthorLayout
          content={
            alexandra ? alexandra.coreContent : defaultTeamMember.coreContent
          }
        >
          <MDXLayoutRenderer
            code={
              alexandra
                ? alexandra.raw.body.code
                : defaultTeamMember.raw.body.code
            }
          />
        </AuthorLayout>
      </div>
      <h2 className="mt-8 text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod">
        Contributors
      </h2>
      <div key={heather?.coreContent.name}>
        <AuthorLayout
          content={
            heather ? heather.coreContent : defaultTeamMember.coreContent
          }
        >
          <MDXLayoutRenderer
            code={
              heather ? heather.raw.body.code : defaultTeamMember.raw.body.code
            }
          />
        </AuthorLayout>
      </div>
    </div>
  );
}
