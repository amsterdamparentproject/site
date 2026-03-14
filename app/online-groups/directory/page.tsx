import { genPageMetadata } from "app/seo";
import DirectoryClient from "./DirectoryClient";

export const metadata = genPageMetadata({
  title: "Online Community Directory",
});

export default function Page() {
  return <DirectoryClient />;
}
