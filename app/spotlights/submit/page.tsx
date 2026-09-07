import { redirect } from "next/navigation";

// This page moved to /newsletter/contribute (now covers Expert & Community
// Spotlights plus Dear Dr. Mom Articles, not just spotlights). Kept as a
// redirect rather than deleted in case this old URL is already out in an
// email or bookmark somewhere.
export default function Page() {
  redirect("/newsletter/contribute");
}
