import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Home } from 'lucide-react';
import { useUser, SignInButton, SignOutButton } from "@clerk/remix";


interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  showQuickNav?: boolean;
  className?: string;
}

export default function Navigation({
  showBackButton = false,
  backTo = "/",
  backLabel = "back",
  showQuickNav = true,
  className = ""
}: NavigationProps) {
  const [currentDate, setCurrentDate] = useState('');

  const { isSignedIn, user } = useUser();
  
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      );
    };

    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
  <>
    {showQuickNav && (
      <div className={`w-full bg-darkgreen py-4 px-12 flex items-center justify-between ${className}`}>
        {/* Left Side: Directory Link */}
        <div className="flex items-center gap-6">
          <Link
            to="/directory"
            className="flex items-center gap-3 px-6 py-3 bg-background text-darkgreen rounded-full hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            <Home size={20} />
            directory
          </Link>
        </div>

        {/* Center: Current Date */}
        <span className="text-background text-lg italic font-light lowercase">
          {currentDate}
        </span>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <span className="text-background text-sm italic">
                {user?.fullName || user?.username}
              </span>
              <SignOutButton>
                <button className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                  Sign out
                </button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm bg-white text-darkgreen rounded hover:bg-gray-100 transition">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    )}
  </>
)};
