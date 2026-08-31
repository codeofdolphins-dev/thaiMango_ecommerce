"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeResponse | null> => {
      const res = await fetch("/api/me");
      if (!res.ok) return null;
      const body = await res.json();
      return body.data;
    },
    retry: false,
    staleTime: Infinity,
  });

  const isAdmin = meQuery.data?.role === "ADMIN";

  useEffect(() => {
    if (!meQuery.isPending && !isAdmin) router.replace("/login");
  }, [meQuery.isPending, isAdmin, router]);

  if (meQuery.isPending || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F1]">
        <span className="text-xs uppercase tracking-widest text-slate-400">
          {meQuery.isPending ? "Checking admin access..." : "Redirecting to sign in..."}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
