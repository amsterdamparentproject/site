import { redirect } from "next/navigation";

// Pagination is now handled client-side — redirect to base advice page
export default async function Page() {
  redirect("/advice");
}

export async function generateStaticParams() {
  return [];
}
