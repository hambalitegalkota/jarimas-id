export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

interface KomunitasDataAnakPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KomunitasDataAnakPage({
  params,
}: KomunitasDataAnakPageProps) {
  const { id } = await params;
  redirect(`/komunitas/${id}`);
}
