"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function Home() {
  const { isLoading, user, error } = useKindeBrowserClient();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-muted/50 rounded-xl w-full h-full overflow-hidden">
      <h1>Hello World</h1>
    </div>
  );
}
