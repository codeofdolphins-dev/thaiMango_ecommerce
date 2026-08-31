import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AdminGuard from "@/components/admin/AdminGuard";
import Providers from "@/components/public/Providers";

export const metadata: Metadata = {
  title: "Thai Mango — Admin Portal",
  description: "Manage products, orders and customers for Thai Mango.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </Providers>
  );
}
