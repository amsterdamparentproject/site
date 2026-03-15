import { genPageMetadata } from "app/seo";
import DirectoryClient from "./DirectoryClient";

export const metadata = genPageMetadata({
  title: "Community Groups Directory",
});

export default function Page() {
  const webhookUrl = process.env.N8N_ACCESS_DIRECTORY_WEBHOOK_URL;

  return (
    <main>
      <DirectoryClient webhookUrl={webhookUrl} />
    </main>
  );
}
