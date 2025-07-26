// app/routes/_index.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { useUser, SignOutButton } from "@clerk/remix";

export async function loader(args: LoaderFunctionArgs) {
  try {
    const { userId } = await getAuth(args);

  return {
    isAuthenticated: !!userId,
  };
   } catch (error) {
    console.error("Auth error:", error);
    return {
      isAuthenticated: false,
    };
  }
}



export default function Index() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  const { user } = useUser();

  // If not authenticated, show sign up/sign in options
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-9xl font-normal text-darkred mb-2">
          ELLA'S
        </h1>
        <h2 className="text-9xl font-normal text-darkred mb-12">
          WARDROBE
        </h2>
        
        <div className="flex flex-col gap-6">
          <Link 
            to="/sign-up"
            className="bg-darkgreen text-white text-4xl px-20 py-4 rounded-lg font-medium hover:bg-emerald-800 transition-colors text-center"
          >
            get started
          </Link>
          
          <Link 
            to="/sign-in"
            className="border-2 border-darkgreen text-darkgreen text-4xl px-20 py-4 rounded-lg font-medium hover:bg-darkgreen hover:text-white transition-colors text-center"
          >
            sign in
          </Link>
        </div>
      </div>
    );
  }

  // If authenticated, show your original design
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-9xl font-normal text-darkred mb-2">
        ELLA'S
      </h1>
      <h2 className="text-9xl font-normal text-darkred mb-12">
        WARDROBE
      </h2>
      <Link 
        to="/directory"
        className="bg-darkgreen text-white text-4xl px-20 py-4 rounded-lg font-medium hover:bg-emerald-800 transition-colors"
      >
        enter
      </Link>
    </div>
  );
}