import { genPageMetadata } from "app/seo";
import FourthTrimesterProgramClient from "./FourthTrimesterProgramClient";

export const metadata = genPageMetadata({
  title: "Fourth Trimester Program",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/fourth-trimester-program.png`,
    ],
  },
});

export default function Page() {
  return (
    <main>
      <FourthTrimesterProgramClient />
    </main>
  );
}
