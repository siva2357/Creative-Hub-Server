require('dotenv').config(); // Load .env file at the top

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');

const authRouter = require("./routers/authRoutes");
const universityRouter = require("./routers/universityRoutes");
const companyRouter = require("./routers/companyRoutes");
const recruiterProfileRouter = require("./routers/recruiterProfileRoutes");
const jobPostRouter = require("./jobPosts/jobPostsRoutes");
const seekerProfileRouter = require("./routers/seekerProfileRoutes");
const projectUploadRouter = require("./project-upload/projectUploadRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://creative-hub-8d4da.web.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));


// app.use(cors()); // This allows all origins and methods (use cautiously in production).


app.use(helmet({
    crossOriginResourcePolicy: false, // Avoid blocking frontend requests
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// MongoDB Connection with Error Handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// API Routes
app.use('/auth', authRouter);
app.use('/',universityRouter);
app.use('/',companyRouter);
app.use('/',recruiterProfileRouter);
app.use('/',jobPostRouter);
app.use('/',seekerProfileRouter);
app.use('/',projectUploadRouter);


// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: "Hello from the server" });
});

// // Start Server with Port Fallback
// app.listen(process.env.PORT , () => {
//     console.log(`Server started on port ${process.env.PORT}`);
// });

const PORT = process.env.PORT || 3000; // Ensure Render assigns the port dynamically

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server started on port ${PORT}`);
});
