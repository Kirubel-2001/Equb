import React, { useState } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { CreatedEqubs } from "./MyEqubLlistComponents/CreatedEqubs";
import { JoinedEqubs } from "./MyEqubLlistComponents/JoinedEqubs";
import { ParticipantEqubs } from "./MyEqubLlistComponents/ParticipantEqubs";
import { CreateEqub } from "./CreateEqub";

export const MyEqubsList = ({
  equbs,
  showAdminControls = false,
  onEqubDeleted,
  onEqubUpdated,
  onRatingSubmitted,
  onComplaintSubmitted,
}) => {
  // Filter equbs by type
  const createdEqubs = equbs.filter((equb) => equb.type === "created");
  const joinedEqubs = equbs.filter((equb) => equb.type === "joined");
  const participantEqubs = equbs.filter((equb) => equb.type === "participant");
  const [showPopup, setShowPopup] = useState(false);
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {equbs.length > 0 ? (
        <div className="space-y-8">
          {createdEqubs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">
                Created by me
              </h3>
              <CreatedEqubs
                equbs={createdEqubs}
                showAdminControls={showAdminControls}
                onEqubDeleted={onEqubDeleted}
                onEqubUpdated={onEqubUpdated}
              />
            </div>
          )}

          {joinedEqubs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">
                Joined
              </h3>
              <JoinedEqubs
                equbs={joinedEqubs}
                onRatingSubmitted={onRatingSubmitted}
                onComplaintSubmitted={onComplaintSubmitted}
              />
            </div>
          )}

          {participantEqubs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">
                Participant
              </h3>
              <ParticipantEqubs
                equbs={participantEqubs}
                onRatingSubmitted={onRatingSubmitted}
                onComplaintSubmitted={onComplaintSubmitted}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No Equbs found matching your criteria.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            onClick={() => setShowPopup(true)}
          >
            Create a new Equb
          </button>
          {showPopup && (
            <CreateEqub
              isOpen={showPopup}
              onClose={() => setShowPopup(false)}
            />
          )}
        </div>
      )}
    </motion.section>
  );
};
