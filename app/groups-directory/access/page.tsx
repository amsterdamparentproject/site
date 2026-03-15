import { genPageMetadata } from "app/seo";
import AccessClient from "./AccessClient";

export const metadata = genPageMetadata({
  title: "Online Community Directory",
});

export default function Page() {
  return <AccessClient />;
}
