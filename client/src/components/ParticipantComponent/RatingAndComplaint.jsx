import React, { useState, useEffect } from "react";
import { Star, AlertCircle, Check } from "lucide-react";

export const RatingAndComplaint = ({ 
  equbId,
  onRatingSubmitted,
  onComplaintSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [complaint, setComplaint] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [showComplaintSuccess, setShowComplaintSuccess] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [complaintError, setComplaintError] = useState("");

  // Fetch user's existing rating on mount
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const response = await fetch(`/api/rating/user/${equbId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rating) {
            setRating(data.rating);
            setUserRating(data.rating);
          }
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
      }
    };

    fetchUserRating();
  }, [equbId]);

  const handleRatingClick = async (selectedRating) => {
    setRating(selectedRating);
    
    try {
      setRatingError("");
      const response = await fetch(`/api/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          equbId: equbId,
          rating: selectedRating 
        }),
      });

      if (response.ok) {
        setUserRating(selectedRating);
        setShowRatingSuccess(true);
        setTimeout(() => setShowRatingSuccess(false), 3000);
        
        // Notify parent component
        if (onRatingSubmitted) {
          onRatingSubmitted(selectedRating);
        }
      } else {
        const errorData = await response.json();
        setRatingError(errorData.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingError("Failed to submit rating. Please try again.");
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaint.trim()) {
      setComplaintError("Please enter a complaint description");
      return;
    }
    
    try {
      setComplaintError("");
      const response = await fetch(`/api/complaint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          equbId: equbId,
          description: complaint 
        }),
      });

      if (response.ok) {
        setComplaint("");
        setShowComplaintSuccess(true);
        setTimeout(() => setShowComplaintSuccess(false), 3000);
        
        // Notify parent component
        if (onComplaintSubmitted) {
          onComplaintSubmitted();
        }
      } else {
        const errorData = await response.json();
        setComplaintError(errorData.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setComplaintError("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Rating Section */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Rate this Equb</h4>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
          
          {userRating > 0 && !showRatingSuccess && (
            <span className="ml-2 text-sm text-gray-600">
              You rated this {userRating} out of 5
            </span>
          )}
          
          {showRatingSuccess && (
            <span className="ml-2 text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Rating submitted!
            </span>
          )}
        </div>
        
        {ratingError && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {ratingError}
          </p>
        )}
      </div>

      {/* Complaint Section */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Submit a Complaint</h4>
        <form onSubmit={handleComplaintSubmit}>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Describe your issue with this Equb..."
          ></textarea>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              {complaintError && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {complaintError}
                </p>
              )}
              
              {showComplaintSuccess && (
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Complaint submitted successfully!
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};