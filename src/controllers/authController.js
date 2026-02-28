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
        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const userId = await userModel.createUser({
            name,
            email,
            passwordHash,
            avatarUrl
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

    if (!email || !password) {
        return res.status(400).render("pages/login", {
            authError: "Email and password are required."
        });
    }

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).render("pages/login", {
                authError: "Invalid email or password."
            });
        }

        const matched = await bcrypt.compare(password, user.password_hash);
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

function renderProfile(req, res) {
    res.render("pages/profile", {
        profileError: null,
        profileSuccess: null
    });
}

async function updateAvatar(req, res) {
    if (!req.file) {
        return res.status(400).render("pages/profile", {
            profileError: "Please select an image.",
            profileSuccess: null
        });
    }

    try {
        const avatarUrl = `/uploads/${req.file.filename}`;
        await userModel.updateAvatar(req.session.userId, avatarUrl);

        const user = await userModel.findUserById(req.session.userId);
        persistSessionUser(req, user);

        return res.redirect("/profile");
    } catch (error) {
        console.error("Update avatar failed:", error.message);
        return res.status(500).render("pages/profile", {
            profileError: "Failed to update avatar.",
            profileSuccess: null
        });
    }
}

async function updateProfile(req, res) {
    const name = String(req.body.fullname || "").trim();
    const email = normalizeEmail(req.body.email);

    if (!name || !email) {
        return res.status(400).render("pages/profile", {
            profileError: "Name and email are required.",
            profileSuccess: null
        });
    }

    try {
        const existing = await userModel.findUserByEmail(email);
        if (existing && existing.id !== req.session.userId) {
            return res.status(409).render("pages/profile", {
                profileError: "This email is already registered.",
                profileSuccess: null
            });
        }

        await userModel.updateProfile(req.session.userId, { name, email });
        const user = await userModel.findUserById(req.session.userId);
        persistSessionUser(req, user);

        return res.render("pages/profile", {
            profileError: null,
            profileSuccess: "Profile updated successfully."
        });
    } catch (error) {
        console.error("Update profile failed:", error.message);
        return res.status(500).render("pages/profile", {
            profileError: "Failed to update profile.",
            profileSuccess: null
        });
    }
}

async function updatePassword(req, res) {
    const currentPassword = String(req.body.current_password || "");
    const newPassword = String(req.body.new_password || "");
    const confirmPassword = String(req.body.confirm_password || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).render("pages/profile", {
            profileError: "Please fill in all password fields.",
            profileSuccess: null
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).render("pages/profile", {
            profileError: "New password must be at least 8 characters.",
            profileSuccess: null
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).render("pages/profile", {
            profileError: "New passwords do not match.",
            profileSuccess: null
        });
    }

    try {
        const user = await userModel.findUserByIdWithPassword(req.session.userId);
        const matched = await bcrypt.compare(currentPassword, user.password_hash);

        if (!matched) {
            return res.status(401).render("pages/profile", {
                profileError: "Current password is incorrect.",
                profileSuccess: null
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await userModel.updatePassword(req.session.userId, newHash);

        return res.render("pages/profile", {
            profileError: null,
            profileSuccess: "Password updated successfully."
        });
    } catch (error) {
        console.error("Update password failed:", error.message);
        return res.status(500).render("pages/profile", {
            profileError: "Failed to update password.",
            profileSuccess: null
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
    logout,
    renderProfile,
    updateAvatar,
    updateProfile,
    updatePassword
};