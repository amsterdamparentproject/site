import { redirect } from "next/navigation";

export default function TagPage() {
  redirect("/read");
}

export async function generateStaticParams() {
  return [];
}
