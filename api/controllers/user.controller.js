// In user.controller.js
import User from '../models/user.model.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Update user by ID
export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Optional: Remove fields that shouldn't be updated
      const { role, password, ...allowedUpdates } = updates;
  
      const updatedUser = await User.findByIdAndUpdate(
        id, 
        allowedUpdates, 
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ 
        message: "User updated successfully", 
        user: updatedUser 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error updating user", 
        error: error.message 
      });
    }
  };
  
  // Delete user by ID
  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        message: "User deleted successfully",
        user: deletedUser 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error deleting user", 
        error: error.message 
      });
    }
  };