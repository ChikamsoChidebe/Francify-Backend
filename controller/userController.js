const User = require('../model/user');
const bcrypt = require('bcryptjs');

const signUp = async (req, res) => {
    console.log(req.body)

    try {
        let {name, email, password} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        let hashedPassword = await bcrypt.hash(password,10)

         const isAdmin = email === "chikamsofavoured@gmail.com";

        const newUser = await new User({
            name,
            email,
            password : hashedPassword,
            isAdmin
        });
        await newUser.save(); 
        res.status(201).json({message:"Sign up successful!"})

    } catch (error) {
        console.log("Internal Server error")
        res.send(error)
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

const jwt = require('jsonwebtoken');

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
        // const token = jwt.sign(
        //     { id: user._id, email: user.email, role: user.role },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '1h' }
        // );

        res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, role: user.role, isAdmin: user.role === "Admin" } });
    } catch (error) {
        console.log("Internal Server Error");
        res.status(500).send(error);
    }
};

const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Internal Server Error");
        res.status(500).send(error);
    }
};

module.exports = {
    signUp,
    getUsers,
    getOneUser,
    login,
    getProfile
}
