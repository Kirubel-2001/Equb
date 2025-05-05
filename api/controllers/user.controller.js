// In user.controller.js
import User from '../models/user.model.js';
import bcrypt from 'bcrypt'; // You'll need this for password hashing

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

// Get current user (based on authenticated user)
export const getCurrentUser = async (req, res) => {
  try {
    // Assuming req.user is set by authentication middleware
    const userId = req.user.userId;
    
    const currentUser = await User.findById(userId).select('-password');
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(currentUser);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving current user", 
      error: error.message 
    });
  }
};

// Update current user profile including password, firstName, lastName, and phone
export const updateCurrentUser = async (req, res) => {
  try {
    // Assuming req.user is set by authentication middleware
    const userId = req.user.userId;
    const { firstName, lastName, phone, password, ...otherUpdates } = req.body;
    
    // Initialize updateData with allowed fields
    const updateData = {};
    
    // Only add fields that are provided and allowed to be updated
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    
    // Hash the password if it's provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Find the user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating profile", 
      error: error.message 
    });
  }
};