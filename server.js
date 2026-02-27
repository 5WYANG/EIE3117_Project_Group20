const path = require("path");
const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");

const pageRoutes = require("./src/routes/pageRoutes");
const apiRoutes = require("./src/routes/apiRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "findit-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/", pageRoutes);
app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server error. Please try again later.");
});

app.listen(port, () => {
  console.log(`FindIt server running on http://localhost:${port}`);
});
