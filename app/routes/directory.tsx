import { Link } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

export default function Directory() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-['Instrument_Serif'] px-8">
      <h1 className="text-8xl font-normal italic text-center text-darkgreen mb-20">
        directory
      </h1>

      <div className="grid grid-cols-2 gap-12 w-full max-w-2xl mb-12">
        <Link 
          to="/wardrobe"
          className="bg-darkgreen text-white py-8 px-12 rounded-lg text-center text-3xl font-medium hover:bg-emerald-800 transition-colors"
        >
          wardrobe
        </Link>

        <Link 
          to="/pack"
          className="bg-darkgreen text-white py-8 px-12 rounded-lg text-center text-3xl font-medium hover:bg-emerald-800 transition-colors"
        >
          pack
        </Link>

        <Link 
          to="/plan"
          className="bg-darkgreen text-white py-8 px-12 rounded-lg text-center text-3xl font-medium hover:bg-emerald-800 transition-colors"
        >
          plan
        </Link>

        <Link 
          to="/upload"
          className="bg-darkgreen text-white py-8 px-12 rounded-lg text-center text-3xl font-medium hover:bg-emerald-800 transition-colors"
        >
          upload
        </Link>
      </div>

      {/* Centered Back Button */}
      <Link
        to="/" 
        className="flex items-center gap-2 text-darkgreen hover:text-emerald-800 text-xl font-medium transition-colors"
      >
        <ArrowLeft size={24} />
        back
      </Link>
    </div>
  );
}