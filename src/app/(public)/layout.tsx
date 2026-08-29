import PublicShell from "@/components/public/PublicShell";
import { StoreProvider } from "@/components/public/store";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <PublicShell>{children}</PublicShell>
    </StoreProvider>
  );
}
