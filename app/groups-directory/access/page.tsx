import { genPageMetadata } from "app/seo";
import AccessClient from "./AccessClient";

export const metadata = genPageMetadata({
  title: "Request Groups Directory Access",
});

export default function Page() {
  return <AccessClient />;
}
