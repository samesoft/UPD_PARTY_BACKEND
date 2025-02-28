// Import required modules
const { sequelize } = require("./config/dbConfig") // Import Sequelize instance
const cors = require("cors")
const nocache = require("nocache")
const dotenv = require("dotenv")
const express = require("express")
const http = require("http")
const path = require("path")
// require('./schedulers/scheduler');

// Load environment variables from .env file
dotenv.config()

// Initialize Express app
const app = express()
app.use(nocache()) // Prevent caching

// Middleware to parse request bodies
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// CORS Configuration
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}
app.use(cors(corsOptions))

// Check database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully!")
  })
  .catch((error) => {
    console.error("Error connecting to database:", error.message)
    console.error("Full error:", error)
  })

// Import and mount membership level route
const membershipLevelRoute = require("./routes/membershipLevelRoute")
const stateRoute = require("./routes/stateRoute")
const memberRoute = require("./routes/memberRoute")
const ageGroupRoute = require("./routes/ageGroupRoute")
const partyRoleRoute = require("./routes/partyRoleRoute")
const districtRoute = require("./routes/districtRoute")
const regionRoute = require("./routes/regionRoute")
const educationLevelRoute = require("./routes/educationLevelRoute")
const usersRoute = require("./routes/userRoute")
const eventRoute = require("./routes/eventRoute")
const roleRoute = require("./routes/roleRoute")
const dashboardRoute = require("./routes/dashboardRoute")

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/membership-level", membershipLevelRoute)
app.use("/api/state", stateRoute)
app.use("/api/members", memberRoute)
app.use("/api/age-groups", ageGroupRoute)
app.use("/api/party-role", partyRoleRoute)
app.use("/api/district", districtRoute)
app.use("/api/region", regionRoute)
app.use("/api/education-level", educationLevelRoute)
app.use("/api/users", usersRoute)
app.use("/api/events", eventRoute)
app.use("/api/roles", roleRoute)
app.use("/api/dashboard", dashboardRoute)

// Version endpoint (optional)
app.get("/version", (req, res) => {
  res.json({ version: 7 })
})

// Start the server
const port = process.env.PORT || 3200 // Use PORT from .env or default to 3200
const server = http.createServer(app)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

