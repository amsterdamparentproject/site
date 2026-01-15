import Image from "./Image";
import Link from "./Link";
import { allAuthors, Authors } from "contentlayer/generated";
import { coreContent } from "pliny/utils/contentlayer";
import DownloadFileButton from "@/components/DownloadFileButton";

function FTPSessionCard(args) {
  const { title, href, description, subtitle, experts, downloadFile } = args;

  const expertDetails = experts.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author);
    return coreContent(authorResults as Authors);
  });

  return (
    <div className="pr-4 pl-4 pt-4 w-full xl:max-w-98">
      <div className="overflow-hidden rounded-md border border-brand-sand/60 dark:border-brand-soft-charcoal/60 flex flex-row xl:min-h-110">
        <div className="p-6">
          <h2 className="text-2xl leading-6 mb-1 font-bold tracking-tight">
            {href ? (
              <Link href={href} aria-label={`Link to ${title}`}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle && <p className="mb-3 text-sm italic">{subtitle}</p>}
          {downloadFile && (
            <div className="mb-2">
              <DownloadFileButton
                filePath={downloadFile}
                buttonText="Download the guide"
                umamiName="Fourth Trimester Program: Download guide"
              />
            </div>
          )}
          <p className="prose mb-3 text-sm max-w-none text-brand-soft-charcoal dark:text-brand-white">
            {description}
          </p>
          <h3 className="mb-3 font-bold">Expert content by:</h3>
          {experts && (
            <div>
              <ul className="flex flex-wrap sm:space-x-4 xl:space-y-2 xl:space-x-0">
                {expertDetails.map((author) => (
                  <li className="flex space-x-3" key={author.name}>
                    {author.avatar && (
                      <Image
                        src={author.avatar}
                        width={55}
                        height={55}
                        alt="avatar"
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <dl className="text-xs leading-5 font-medium">
                      <dt className="sr-only">Name</dt>
                      <dd className="dark:text-brand-white">
                        {author.website && (
                          <Link
                            href={author.website}
                            className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
                          >
                            {author.name}
                          </Link>
                        )}
                      </dd>
                      <dt className="sr-only">Title</dt>
                      <dd className="text-brand-soft-charcoal dark:text-brand-white">
                        {author.occupation}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FTPSessionCard;
