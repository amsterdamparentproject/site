import { genPageMetadata } from "app/seo";
import DirectoryClient from "./DirectoryClient";

export const metadata = genPageMetadata({
  title: "Amsterdam Parent Groups Directory",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/groups-directory.png`,
    ],
  },
});

export default function Page() {
  return (
    <main>
      <DirectoryClient />
    </main>
  );
}
