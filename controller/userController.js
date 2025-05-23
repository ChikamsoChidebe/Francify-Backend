const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRETKEY || '1A2B3C4D5E6F';

const signUp = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        // Set admin fields for the specific email
        let isAdmin = false;
        let role = "User";
        if (email === "chikamsofavoured@gmail.com") {
            isAdmin = true;
            role = "Admin";
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "Sign up successful!" });

    } catch (error) {
        console.log("Internal Server error");
        res.status(500).send(error);
    }
}

const getUsers = async (req,res)=>{
    try {
        const users = await User.find()
        if(!users) return res.status(404).json({message:"No users found"})

        res.status(200).json(users)

    } catch (error) {
        console.log("Internal Server Error")
        res.send(error)
    }
}

const getOneUser = async(req,res)=>{
    try {
        let {id} = req.params;
        const users = await User.findById(id)
        if(!users) return res.status(404).json({message:"No users found"})

        res.status(200).json(users)   
    } catch (error) {
        console.log("Internal Server Error")
        res.send(error)
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Authentication successful
        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error); // This prints the full error object
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Internal Server Error");
        res.status(500).send(error);
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

module.exports = {
    signUp,
    getUsers,
    getOneUser,
    login,
    getProfile,
    updateProfile
}
