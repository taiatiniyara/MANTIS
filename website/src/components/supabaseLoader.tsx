import { Archive } from "lucide-react";
import React from "react";
import PuffLoader from "react-spinners/PuffLoader";

export default function SupabaseDataLoader<T>({
  children,
  isLoading,
  error,
  data,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  error: Error | null;
  data?: T[];
}) {
  if (isLoading) {
    return (
      <div className="m-4 p-4 flex justify-center items-center flex-col gap-2 text-neutral-500">
        <PuffLoader color="#1d4ed8" />
        <p>Loading Data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-100 border border-red-500 text-red-600 p-4 m-4 text-center">
        Error: {error.message}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="m-4 p-4 flex justify-center items-center flex-col gap-2 text-neutral-500 bg-neutral-100 border rounded border-dashed">
        <Archive size={35} /> <p>No data available.</p>
      </div>
    );
  }

  return <>{children}</>;
}
