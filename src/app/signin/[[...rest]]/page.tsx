import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email to sign in or create an account
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "shadow-lg border border-border bg-card",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "border border-border bg-background hover:bg-muted text-foreground",
              formFieldInput:
                "border border-border bg-background text-foreground",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
              footerAction: "text-center",
              identityPreview: "border border-border bg-muted",
              otpCodeFieldInput:
                "border border-border bg-background text-foreground",
            },
          }}
          routing="path"
          path="/signin"
          redirectUrl="/"
          forceRedirectUrl="/"
          withSignUp={true}
        />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="hover:text-primary/80 font-medium text-primary underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
