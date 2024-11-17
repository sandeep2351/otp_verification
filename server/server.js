import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/connection.js";
import router from "./routes/route.js";

const app = express();
const port = process.env.PORT || 9090;

// Middleware setup
app.use(express.json({ limit: '10mb' }));  // Increase payload size limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(morgan("tiny"));
app.disable("x-powered-by");

// Home route
app.get("/", (req, res) => {
  res.status(201).json({ message: "Home GET request" });
});

// API routes
app.use("/api", router);

// Start the server after successful database connection
connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
