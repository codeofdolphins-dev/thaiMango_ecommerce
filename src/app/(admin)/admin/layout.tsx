import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Thai Mango — Admin Portal",
  description: "Manage products, orders and customers for Thai Mango.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
