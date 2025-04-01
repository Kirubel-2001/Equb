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
