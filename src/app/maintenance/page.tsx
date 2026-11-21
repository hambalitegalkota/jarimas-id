import type { Metadata } from "next";
import { MaintenanceClientView } from "./maintenance-client-view";

export const metadata: Metadata = {
  title: "Website Sedang Dalam Perbaikan | JARIMAS-ID",
  description:
    "Website sedang dalam perbaikan. Kembali lagi nanti yah. Terimakasih.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return <MaintenanceClientView />;
}
