import { redirect } from "next/navigation";

export default function TagPagePaginated() {
  redirect("/read");
}

export async function generateStaticParams() {
  return [];
}
