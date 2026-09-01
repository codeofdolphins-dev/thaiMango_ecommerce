"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      try {
        const res = await axios.get("/api/me");
        return res.data.data;
      } catch (error) {
        // Only a 401 means "not signed in". Server errors and network blips are
        // rethrown so the query retries instead of signing a valid admin out.
        if (axios.isAxiosError(error) && error.response?.status === 401) return null;
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attempt) => 500 * 2 ** attempt,
    staleTime: Infinity,
  });

  const isAdmin = meQuery.data?.role === "ADMIN";

  useEffect(() => {
    if (meQuery.isSuccess && !isAdmin) router.replace("/login");
  }, [meQuery.isSuccess, isAdmin, router]);

  if (meQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
        <span className="text-xs uppercase tracking-widest text-muted/70">
          Couldn&apos;t verify your admin access
        </span>
        <p className="max-w-sm text-sm text-muted">
          The server didn&apos;t respond. Check your connection and try again — you are still
          signed in.
        </p>
        <button
          type="button"
          onClick={() => meQuery.refetch()}
          disabled={meQuery.isFetching}
          className="rounded-full bg-accent px-6 py-2 text-xs uppercase tracking-widest text-white hover:bg-burgundy transition disabled:opacity-50"
        >
          {meQuery.isFetching ? "Retrying..." : "Try again"}
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <span className="text-xs uppercase tracking-widest text-muted/70">
          {meQuery.isPending ? "Checking admin access..." : "Redirecting to sign in..."}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
