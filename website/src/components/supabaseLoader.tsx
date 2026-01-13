import React from "react";
import BarLoader from "react-spinners/GridLoader";

export default function SupabaseDataLoader({
  children,
  isLoading,
  error,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return <BarLoader color="#1d4ed8" />;
  }

  if (error) {
    return (
      <div className="w-full bg-red-100 border border-red-500 text-red-600 p-4 m-4 text-center">
        Error: {error.message}
      </div>
    );
  }

  return <>{children}</>;
}
