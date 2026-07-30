import { SignIn } from "@clerk/nextjs";
import { authEnabled } from "@/lib/auth";

export default function SignInPage() {
  if (!authEnabled()) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl">Sign in is not configured</h1>
        <p className="mt-3 text-sage-600">
          This environment is running in guest-only mode.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </main>
  );
}
