import Equb from "../models/equb.model.js";


// Create a new Equb
export const createEqub = async (req, res, next) => {
  try {
    const {
      name,
      location,
      numberOfParticipants,
      amountPerPerson,
      cycle,
      equbType,
      description,
    } = req.body.formData;

    // Create new Equb
    const newEqub = new Equb({
      name,
      location,
      creator: req.user.userId,
      numberOfParticipants,
      amountPerPerson,
      cycle,
      equbType,
      description,
    });

    const equb = await newEqub.save();

    // Automatically add creator as a participant with Accepted status
    //   const participant = new Participant({
    //     equb: equb.id,
    //     user: req.user.id,
    //     status: "Accepted"
    //   });

    //   await participant.save();

    //   res.json(equb);
    res.status(201).json(equb);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all Equbs
export const getEqubs = async (req, res, next) => {
  try {
    const equbs = await Equb.find();
    res.json(equbs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all equbs created by the current user
export const getMyEqubs = async (req, res) => {
  try {
    const equbs = await Equb.find({ creator: req.user.userId })
    .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(equbs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function for getting equbs joined by the user
export const getJoinedEqubs = async (req, res) => {
  try {
    const equbs = await Equb.find({ 
      members: { $elemMatch: { userId: req.user.userId } },
      creator: { $ne: req.user.userId } // Exclude equbs created by the user
    }).sort({ createdAt: -1 });
    
    res.json(equbs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Equb
export const deleteEqub = async (req, res) => {
  try {
    const equb = await Equb.findById(req.params.id);
    
    // Check if equb exists
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }
    
    // Check if the user is the creator of the equb
    if (equb.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this equb" });
    }
    
    // Delete the equb
    await Equb.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Equb deleted successfully" });
  } catch (error) {
    console.error("Error deleting equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an Equb
export const updateEqub = async (req, res) => {
  try {
    const { 
      name, 
      location, 
      numberOfParticipants, 
      amountPerPerson, 
      cycle, 
      equbType, 
      description 
    } = req.body.formData;
    
    const equb = await Equb.findById(req.params.id);
    
    // Check if equb exists
    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }
    
    // Check if the user is the creator of the equb
    if (equb.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this equb" });
    }
    
    // Make sure new number of participants isn't less than current participants
    if (numberOfParticipants < equb.currentParticipants) {
      return res.status(400).json({ 
        message: "Cannot reduce number of participants below current count" 
      });
    }
    
    // Update the equb
    const updatedEqub = await Equb.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location,
        numberOfParticipants,
        amountPerPerson,
        cycle,
        equbType,
        description
      },
      { new: true }
    );
    
    res.json(updatedEqub);
  } catch (error) {
    console.error("Error updating equb:", error);
    res.status(500).json({ message: "Server error" });
  }
};