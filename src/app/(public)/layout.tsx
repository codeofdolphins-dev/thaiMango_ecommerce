import PublicShell from "@/components/public/PublicShell";
import Providers from "@/components/public/Providers";
import { StoreProvider } from "@/components/public/store";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <StoreProvider>
        <PublicShell>{children}</PublicShell>
      </StoreProvider>
    </Providers>
  );
}
