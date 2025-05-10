"use client";

import { SignIn } from "@/components/auth/sign-in";
import { useSearchParams } from "next/navigation";

export default function TestLoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <SignIn returnUrl={returnUrl} />
      </div>
    </div>
  );
}
