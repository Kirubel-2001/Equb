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
    console.log(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
