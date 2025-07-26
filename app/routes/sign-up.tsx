// app/routes/sign-up.tsx
import { SignUp } from "@clerk/remix";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-normal text-darkred mb-2">
            ELLA'S
          </h1>
          <h2 className="text-6xl font-normal text-darkred mb-4">
            WARDROBE
          </h2>
          <p className="text-darkgreen text-lg font-medium">
            create your account
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-darkgreen hover:bg-emerald-800 text-white normal-case font-medium",
                card: "bg-background border border-darkgreen shadow-lg",
                headerTitle: "text-darkred font-normal",
                headerSubtitle: "text-darkgreen",
                socialButtonsBlockButton: "border-darkgreen text-darkgreen hover:bg-darkgreen hover:text-white",
                formFieldLabel: "text-darkgreen font-medium",
                formFieldInput: "border-darkgreen focus:border-darkred",
                footerActionLink: "text-darkgreen hover:text-darkred",
              },
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}