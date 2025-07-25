import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { Home } from 'lucide-react';

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
  showQuickNav = false,
  className = ""
}: NavigationProps) {
  const [currentDate, setCurrentDate] = useState('');

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
          <div className="flex items-center gap-6">
            <Link
              to="/directory"
              className="flex items-center gap-3 px-6 py-3 bg-background text-darkgreen rounded-full hover:bg-gray-100 transition-colors text-lg font-medium"
            >
              <Home size={20} />
              directory
            </Link>
          </div>

          <span className="text-background text-lg italic font-light lowercase">
            {currentDate}
          </span>
        </div>
      )}
    </>
  );
}
