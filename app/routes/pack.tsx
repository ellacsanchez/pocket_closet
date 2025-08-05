import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { PlanningCanvas } from "~/components/PlanningCanvas";
import { WardrobePanel } from "~/components/WardrobePanel";

export default function Pack() {
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showWardrobePanel, setShowWardrobePanel] = useState(false);
  const navigate = useNavigate();

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowWardrobePanel(true);
  };

  const handleBackToOverview = () => {
    setSelectedDay(null);
    setShowWardrobePanel(false);
  };

  const handleViewAllOutfits = () => {
    navigate("/outfits");
  };

  // If a day is selected, show the planning canvas
  if (selectedDay !== null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Main planning area */}
          <div className={`flex-1 transition-all duration-300 ${showWardrobePanel ? 'mr-80' : ''}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Trip Overview
                </button>
                <h1 className="text-2xl font-bold text-gray-800">
                  Day {selectedDay} Outfit Planning
                </h1>
                <button
                  onClick={handleViewAllOutfits}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Outfits
                </button>
              </div>
              <PlanningCanvas dayNumber={selectedDay} />
            </div>
          </div>

          {/* Wardrobe panel */}
          {showWardrobePanel && (
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Wardrobe</h2>
                  <button
                    onClick={() => setShowWardrobePanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <WardrobePanel />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main pack overview screen
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Pack for Your Trip
          </h1>

          {/* Days selector */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 mb-4">
              How many days are you planning for?
            </label>
            <div className="flex items-center space-x-4">
              <select
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day} {day === 1 ? 'day' : 'days'}
                  </option>
                ))}
              </select>
              <span className="text-gray-600">
                The number of days will correspond to the number of boxes shown
              </span>
            </div>
          </div>

          {/* Trip overview */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your {numberOfDays}-Day Trip
            </h2>
            <p className="text-gray-600 mb-6">
              Click on any day to start planning your outfit. Each box represents one day of your trip.
            </p>
          </div>

          {/* Days grid - scrollable window */}
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: numberOfDays }, (_, i) => i + 1).map((dayNumber) => (
                  <button
                    key={dayNumber}
                    onClick={() => handleDayClick(dayNumber)}
                    className="aspect-square bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center group"
                  >
                    <div className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                      Day
                    </div>
                    <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {dayNumber}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 group-hover:text-blue-500 transition-colors">
                      Plan outfit
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Choose the number of days for your trip (up to 31 days)</li>
              <li>• Click on any day box to start planning that day's outfit</li>
              <li>• Use the wardrobe panel to select clothing items</li>
              <li>• View all your planned outfits in the outfits section</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handleViewAllOutfits}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              View All Planned Outfits
            </button>
            <button
              onClick={() => navigate("/plan")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Single Day Planning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}