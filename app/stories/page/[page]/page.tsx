import { redirect } from "next/navigation";

// Pagination is now handled client-side — redirect to base stories page
export default async function Page() {
  redirect("/stories");
}

export async function generateStaticParams() {
  return [];
}
