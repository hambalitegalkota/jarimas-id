import { redirect } from "next/navigation";

interface KotaTegalDataAtsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function KotaTegalDataAtsPage({
  params,
}: KotaTegalDataAtsPageProps) {
  const { slug } = await params;
  redirect(`/kotategal/${slug}?subtab=ats`);
}
