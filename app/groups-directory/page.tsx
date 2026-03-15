import { genPageMetadata } from "app/seo";
import DirectoryClient from "./DirectoryClient";

export const metadata = genPageMetadata({
  title: "Community Groups Directory",
});

export default function Page() {
  return (
    <main>
      <DirectoryClient />
    </main>
  );
}
