import { redirect } from "next/navigation";

interface KelolaAnggotaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KelolaAnggotaPage({
  params,
}: KelolaAnggotaPageProps) {
  const { id } = await params;
  // Halaman Kelola Anggota dialihkan langsung ke tab Anggota Komunitas di halaman utama
  redirect(`/komunitas/${id}?subtab=anggota`);
}
