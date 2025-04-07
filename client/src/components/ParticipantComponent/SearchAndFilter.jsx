import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, MapPin, ChevronDown, X } from "lucide-react";

export const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  amountFilter,
  setAmountFilter,
  locationFilter,
  setLocationFilter,
  setIsTyping,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationRef = useRef(null);

  const locations = [
    "Addis Ababa, Ethiopia",
    "Bahir Dar, Ethiopia",
    "Hawassa, Ethiopia",
    "Dire Dawa, Ethiopia",
    "Mekelle, Ethiopia",
    "Gondar, Ethiopia",
    "Jimma, Ethiopia",
    "Dessie, Ethiopia",
    "Adama, Ethiopia",
    "Bishoftu, Ethiopia",
  ];

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleLocationSelect = (location) => {
    setLocationFilter(location);
    setLocationSearch("");
    setIsLocationDropdownOpen(false);
  };

  const clearLocationFilter = () => {
    setLocationFilter("");
    setLocationSearch("");
  };

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Location Filter */}
      <div className="relative w-full md:w-1/4" ref={locationRef}>
        <div
          onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          className="cursor-pointer flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition w-full"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <span className="truncate">
              {locationFilter || "Select Location"}
            </span>
          </div>
          {locationFilter ? (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                clearLocationFilter();
              }}
            />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {isLocationDropdownOpen && (
          <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-10 border border-gray-100 max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <div
                  key={index}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center"
                  onClick={() => handleLocationSelect(location)}
                >
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">{location}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No locations found. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or amount..."
          className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsTyping(e.target.value.length > 0);
          }}
        />
      </div>

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <Filter className="h-5 w-5 text-gray-500" />
          <span>Filter</span>
        </button>

        {isFilterOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-4 border border-gray-100">
            <h4 className="font-medium mb-3">Status</h4>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="all"
                  checked={activeCategory === "all"}
                  onChange={() => setActiveCategory("all")}
                />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={activeCategory === "Active"}
                  onChange={() => setActiveCategory("Active")}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Pending"
                  checked={activeCategory === "Pending"}
                  onChange={() => setActiveCategory("Pending")}
                />
                <span>Pending</span>
              </label>
            </div>

            <h4 className="font-medium mb-3">Amount Per Person (ETB)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-600">Min</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={amountFilter.min}
                  onChange={(e) =>
                    setAmountFilter({
                      ...amountFilter,
                      min: e.target.value,
                    })
                  }
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={amountFilter.max}
                  onChange={(e) =>
                    setAmountFilter({
                      ...amountFilter,
                      max: e.target.value,
                    })
                  }
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setAmountFilter({ min: "", max: "" });
                  setActiveCategory("all");
                }}
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
