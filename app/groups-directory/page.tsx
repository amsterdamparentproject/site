import { genPageMetadata } from "app/seo";
import DirectoryClient from "./DirectoryClient";

export const metadata = genPageMetadata({
  title: "Amsterdam Parent Groups Directory",
});

export default function Page() {
  return (
    <main>
      <DirectoryClient />
    </main>
  );
}
