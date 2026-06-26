import { genPageMetadata } from "app/seo";
import FirstYearProgramClient from "./FirstYearProgramClient";

export const metadata = genPageMetadata({
  title: "First Year Program",
  description:
    "Your nonprofit first year support system in Amsterdam. Monthly expert-led discussions, local socials, 1:1 peer matching, and a moderated community — from pregnancy through your baby's first year.",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/first-year-program.png`,
    ],
  },
});

export default function Page() {
  return (
    <main>
      <FirstYearProgramClient />
    </main>
  );
}
