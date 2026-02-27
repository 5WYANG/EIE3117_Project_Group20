const path = require("path");
const express = require("express");
const multer = require("multer");
const noticeController = require("../controllers/noticeController");
const authController = require("../controllers/authController");
const {
  requireAuth,
  redirectIfAuthenticated
} = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../public/uploads"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});

const router = express.Router();

router.get("/", (req, res) => res.redirect("/listings"));
router.get("/login", redirectIfAuthenticated, (req, res) => res.render("pages/login"));
router.post("/login", authController.login);
router.get("/signup", redirectIfAuthenticated, (req, res) => res.render("pages/signup"));
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);
router.get("/reset-password", (req, res) => res.render("pages/reset-password"));
router.post("/reset-password", (req, res) => {
  res.redirect("/login");
});
router.get("/contact", (req, res) => res.render("pages/contact"));
router.post("/contact", (req, res) => {
  res.redirect("/contact");
});
router.get("/about", (req, res) => res.render("pages/about"));
router.get("/privacy", (req, res) => res.render("pages/about"));
router.get("/terms", (req, res) => res.render("pages/about"));
router.get("/help", (req, res) => res.render("pages/help"));
router.get("/listings", noticeController.renderListings);
router.get("/items/:id", noticeController.renderNoticeDetail);
router.get("/my-notices", requireAuth, noticeController.renderMyNotices);
router.get("/notices/new", requireAuth, noticeController.renderCreateNotice);
router.post("/notices", requireAuth, upload.array("images", 5), noticeController.createNotice);

module.exports = router;
