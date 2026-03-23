import { genPageMetadata } from "app/seo";
import FourthTrimesterProgramClient from "./FourthTrimesterProgramClient";

export const metadata = genPageMetadata({
  title: "Fourth Trimester Program",
  description:
    "Your nonprofit postpartum support system in Amsterdam. Expert-led discussions and local socials to help you transition to parenthood with confidence.",
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
