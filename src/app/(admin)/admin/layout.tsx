import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AdminGuard from "@/components/admin/AdminGuard";
import Providers from "@/components/public/Providers";

export const metadata: Metadata = {
  title: "Bangkok Mango — Admin Portal",
  description: "Manage products, orders and customers for Thai Mango.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // palette-account rebinds --color-accent/charcoal/ivory/cream/muted to the
    // storefront account palette, the same scope /login and /dashboard use.
    <div className="palette-account">
      <Providers>
        <AdminGuard>
          <AdminShell>{children}</AdminShell>
        </AdminGuard>
      </Providers>
    </div>
  );
}
