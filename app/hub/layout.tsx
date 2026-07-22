import { genPageMetadata } from "app/seo";
import { HubAccountProvider } from "@/app/hub/HubAccountContext";

// Private member area — keep out of search results. Individual /hub/*
// pages can override this by exporting their own metadata.
export const metadata = genPageMetadata({
  title: "First Year Hub",
  robots: {
    index: false,
    follow: false,
  },
});

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <HubAccountProvider>{children}</HubAccountProvider>;
}
