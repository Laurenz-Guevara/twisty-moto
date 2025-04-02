"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isLoading, user, error } = useKindeBrowserClient();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Twisty Moto</h1>
    </div>
  );
}
