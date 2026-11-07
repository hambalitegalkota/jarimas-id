import { redirect } from "next/navigation";

interface KomunitasDataAtsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KomunitasDataAtsPage({
  params,
}: KomunitasDataAtsPageProps) {
  const { id } = await params;
  redirect(`/komunitas/${id}?subtab=ats`);
}
