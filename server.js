const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve images
app.use(express.static(path.join(__dirname))); 
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/swm-complaints');

// Define complaint schema
const complaintSchema = new mongoose.Schema({
  complaintId: String,
  description: String,
  location: String,
  category: String,
  imagePath: String, // NEW FIELD
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Multer config for storing images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder to store images
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Submit complaint with image
app.post('/complaints', upload.single('image'), async (req, res) => {
  const { description, location, category } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  if (!description || !location || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const complaintId = uuidv4().slice(0, 8).toUpperCase(); // e.g. ABCD1234

  const newComplaint = new Complaint({
    complaintId,
    description,
    location,
    category,
    imagePath,
  });

  await newComplaint.save();

  res.json({ message: 'Complaint submitted', complaintId });
});

// Get complaint status
app.get('/complaints/:complaintId', async (req, res) => {
  const { complaintId } = req.params;

  const complaint = await Complaint.findOne({ complaintId });

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  res.json({
    complaintId: complaint.complaintId,
    description: complaint.description,
    location: complaint.location,
    category: complaint.category,
    status: complaint.status,
    imagePath: complaint.imagePath, // include image if exists
    createdAt: complaint.createdAt,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
