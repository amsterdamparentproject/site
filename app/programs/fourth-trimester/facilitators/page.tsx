import { FTPFacilitators, allFTPFacilitators } from "contentlayer/generated";
import { MDXLayoutRenderer } from "pliny/mdx-components";
import AuthorLayout from "@/layouts/AuthorLayout";
import { coreContent } from "pliny/utils/contentlayer";
import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";

export const metadata = genPageMetadata({
  title: "Fourth Trimester Program: Facilitators",
});

const facilitatorDetails = allFTPFacilitators.map((author) => {
  return {
    coreContent: coreContent(author as FTPFacilitators),
    raw: author,
  };
});

export default function Page() {
  const facilitatorDetails = allFTPFacilitators
    .map((member) => {
      return {
        coreContent: coreContent(member as FTPFacilitators),
        raw: member,
      };
    })
    .sort((a, b) => {
      const preferredOrder = [
        "Danielle Bensky",
        "Fayette Bosch",
        "Dr. Irena Miriam Domachowska",
        "Alex Siega",
      ];

      const indexA = preferredOrder.indexOf(a.coreContent.name);
      const indexB = preferredOrder.indexOf(b.coreContent.name);

      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;

      return posA - posB;
    });

  return (
    <div className="pb-6 flex flex-col items-center">
      <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Join the Fourth Trimester Program
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Facilitators
        </h1>
        <p className="mt-4">
          Your{" "}
          <b className="dark:text-brand-goldenrod text-brand-soft-green">
            neighborhood support system in the first months postpartum
          </b>
          , designed for families with newborns. Expert-led discussions and
          curated socials with local newborn parents to help you transition with
          confidence to new parenthood.
          <Link
            href="/programs/fourth-trimester"
            className="text-base leading-6 font-medium italic text-brand-soft-green hover:text-brand-soft-green dark:text-brand-goldenrod"
            aria-label="jan-2026"
          >
            &nbsp;Learn more about the program &rarr;
          </Link>
        </p>
      </div>
      <div className="w-full space-y-12">
        {facilitatorDetails.map((facilitator) => (
          <div
            key={facilitator.coreContent.slug || facilitator.coreContent.name}
          >
            <AuthorLayout content={facilitator.coreContent}>
              <MDXLayoutRenderer code={facilitator.raw.body.code} />
            </AuthorLayout>
          </div>
        ))}
      </div>
    </div>
  );
}
