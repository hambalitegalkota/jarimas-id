export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

interface KotaTegalDataAnakPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KotaTegalDataAnakPage({
  params,
}: KotaTegalDataAnakPageProps) {
  const { slug } = await params;
  redirect(`/kotategal/${slug}`);
}
