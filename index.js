const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { signUp, login, getProfile, getUsers } = require('./controller/userController');
const profileRoute = require('./routes/profileRoute');
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
    origin: ['http://localhost:5173', 'https://francify-online-store.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Removed inline user schema and model definition
const User = require('./model/user');

app.options('/signup', (req, res) => {
    res.sendStatus(200);
});

app.post('/signup',signUp);

app.post('/login', login);

// Modified /profile route to use authentication middleware and pass user id to getProfile
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/profile', authenticateUser, (req, res) => {
  // Pass user id from token to getProfile controller
  req.params.id = req.user.id;
  getProfile(req, res);
});

app.get('/users', getUsers);

app.use('/', profileRoute);

// Admin page route - accessible only to realadmin@gmail.com
// Middleware to authenticate and authorize admin by email
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'realadmin@gmail.com') {
      return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin route
app.get('/admin', authenticateAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin page' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
