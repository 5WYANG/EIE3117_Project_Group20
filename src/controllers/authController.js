const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function persistSessionUser(req, user) {
  req.session.userId = user.id;
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url || null
  };
}

async function signup(req, res) {
  const name = String(req.body.fullname || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const acceptedTerms = req.body.terms;

  if (!name || !email || !password) {
    return res.status(400).render("pages/signup", {
      authError: "Please fill in all required fields."
    });
  }
  if (!acceptedTerms) {
    return res.status(400).render("pages/signup", {
      authError: "You must accept the Terms of Service and Privacy Policy."
    });
  }
  if (password.length < 8) {
    return res.status(400).render("pages/signup", {
      authError: "Password must be at least 8 characters."
    });
  }

  try {
    const existing = await userModel.findUserByEmail(email);
    if (existing) {
      return res.status(409).render("pages/signup", {
        authError: "This email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({
      name,
      email,
      passwordHash,
      avatarUrl: null
    });
    const user = await userModel.findUserById(userId);
    persistSessionUser(req, user);

    return res.redirect("/listings");
  } catch (error) {
    console.error("Signup failed:", error.message);
    return res.status(500).render("pages/signup", {
      authError: "Failed to create account. Please try again."
    });
  }
}

async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  console.log("[Login] Email:", email, "Password length:", password.length);

  if (!email || !password) {
    return res.status(400).render("pages/login", {
      authError: "Email and password are required."
    });
  }

  try {
    const user = await userModel.findUserByEmail(email);
    console.log("[Login] User found:", user ? `Yes (id=${user.id})` : "No");
    if (!user) {
      return res.status(401).render("pages/login", {
        authError: "Invalid email or password."
      });
    }

    console.log("[Login] Hash from DB:", user.password_hash.substring(0, 30));
    const matched = await bcrypt.compare(password, user.password_hash);
    console.log("[Login] Password matched:", matched);
    if (!matched) {
      return res.status(401).render("pages/login", {
        authError: "Invalid email or password."
      });
    }

    persistSessionUser(req, user);
    return res.redirect("/listings");
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).render("pages/login", {
      authError: "Failed to sign in. Please try again."
    });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
}

module.exports = {
  signup,
  login,
  logout
};
