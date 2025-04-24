require('dotenv').config();

// Log environment variables to verify they're loaded
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// Validate environment variables
if (!process.env.PORT || !process.env.MONGODB_URI || !process.env.GEMINI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate Limiting (100 requests/15min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Database Connection with Retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Gemini API Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enhanced Schemas
const facultySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  department: { type: String, required: true },
  office: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  available: { type: Boolean, default: true },
  capacity: { type: Number, min: 1 }
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);
const Room = mongoose.model('Room', roomSchema);

// API Helpers
const apiResponse = (res, status = 200, data = null, error = null) => {
  res.status(status).json({ success: status < 400, data, error });
};

// Validation Middleware
const validate = validations => async (req, res, next) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  apiResponse(res, 400, null, errors.array());
};

// Enhanced Routes
app.post('/api/chat', 
  validate([
    body('message').trim().notEmpty().escape()
  ]),
  async (req, res) => {
    try {
      const { message } = req.body;
      const query = message.toLowerCase();

      // Check for database queries
      if (query.includes('faculty')) {
        const faculty = await Faculty.find().select('-__v').lean();
        return apiResponse(res, 200, { type: 'faculty', data: faculty });
      }

      if (query.includes('room')) {
        const rooms = await Room.find({ available: true }).select('-__v').lean();
        return apiResponse(res, 200, { type: 'rooms', data: rooms });
      }

      // Fallback to Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      apiResponse(res, 200, { 
        type: 'text',
        data: text
      });

    } catch (err) {
      console.error('Chat error:', err);
      apiResponse(res, 500, null, 'Server error');
    }
  }
);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: Date.now()
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  apiResponse(res, 500, null, 'Internal server error');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
