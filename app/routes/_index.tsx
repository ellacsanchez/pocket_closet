/*opening page*/

import { Link } from "@remix-run/react";

export default function Index() {
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