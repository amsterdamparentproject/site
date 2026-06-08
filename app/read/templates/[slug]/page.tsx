import "css/prism.css";
import "katex/dist/katex.css";

import { components } from "@/components/MDXComponents";
import { MDXLayoutRenderer } from "pliny/mdx-components";
import { coreContent } from "pliny/utils/contentlayer";
import { allBlogs, allAuthors } from "contentlayer/generated";
import type { Authors, Blog } from "contentlayer/generated";
import PostSimple from "@/layouts/PostSimple";
import PostLayout from "@/layouts/PostLayout";
import PostBanner from "@/layouts/PostBanner";
import { notFound } from "next/navigation";

const defaultLayout = "PostLayout";
const layouts = { PostSimple, PostLayout, PostBanner };

// Templates live in data/advice/templates/ — their slug is "templates/<name>"
function findTemplate(slug: string) {
  return allBlogs.find(
    (p) =>
      p.slug === `templates/${slug}` && p.path.startsWith("advice/templates/"),
  );
}

export async function generateStaticParams() {
  return allBlogs
    .filter((p) => p.path.startsWith("advice/templates/"))
    .map((p) => ({ slug: p.slug.replace("templates/", "") }));
}

export default async function TemplatePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = findTemplate(slug) as Blog | undefined;

  if (!post) return notFound();

  const authorList = post.authors || ["default"];
  const authorDetails = authorList.map((author) => {
    const result = allAuthors.find((p) => p.slug === author);
    return coreContent(result as Authors);
  });

  const mainContent = coreContent(post);
  const Layout = layouts[post.layout || defaultLayout];

  return (
    <Layout content={mainContent} authorDetails={authorDetails}>
      <MDXLayoutRenderer
        code={post.body.code}
        components={components}
        toc={post.toc}
      />
    </Layout>
  );
}
