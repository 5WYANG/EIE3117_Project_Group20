const noticeModel = require("../models/noticeModel");
const userModel = require("../models/userModel");
const {
    sampleNotices,
    sampleResponses,
    sampleUser
} = require("../data/sampleData");

function getSessionUserId(req) {
    return req.session && req.session.userId ? Number(req.session.userId) : null;
}

function normalizeNoticeRow(row) {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        category: row.category,
        subcategory: row.subcategory,
        location_text: row.location_text,
        occurred_at: row.occurred_at,
        reward_amount: row.reward_amount,
        status: row.status,
        view_count: row.view_count,
        created_at: row.created_at,
        image_url: row.image_url
    };
}

async function renderListings(req, res) {
    try {
        const filter = String(req.query.filter || "all").toLowerCase();
        const nearLocation = "Hong Kong";

        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const pageSize = 8;
        const offset = (page - 1) * pageSize;

        const [notices, total] = await Promise.all([
            noticeModel.fetchActiveNoticesFilteredPaged(filter, nearLocation, pageSize, offset),
            noticeModel.countActiveNoticesFiltered(filter, nearLocation)
        ]);

        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        res.render("pages/listings", {
            notices: notices.map(normalizeNoticeRow),
            activeFilter: filter,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("DB error, fallback to sample listings:", error.message);

        const filter = String(req.query.filter || "all").toLowerCase();
        const nearLocation = "Hong Kong";
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const pageSize = 8;
        const offset = (page - 1) * pageSize;

        const activeOnly = sampleNotices.filter((n) => n.status === "active");
        let filtered = activeOnly;

        if (filter === "lost") filtered = activeOnly.filter((n) => n.type === "lost");
        if (filter === "found") filtered = activeOnly.filter((n) => n.type === "found");
        if (filter === "near") {
            filtered = activeOnly.filter((n) =>
                String(n.location_text || "").includes(nearLocation)
            );
        }

        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const pageItems = filtered.slice(offset, offset + pageSize);

        res.render("pages/listings", {
            notices: pageItems,
            activeFilter: filter,
            currentPage: page,
            totalPages
        });
    }
}

async function renderNoticeDetail(req, res) {
    const noticeId = Number(req.params.id);
    try {
        const notice = await noticeModel.fetchNoticeById(noticeId);
        if (!notice) {
            return res.status(404).send("Notice not found.");
        }

        await noticeModel.incrementViewCount(noticeId);
        notice.view_count = Number(notice.view_count || 0) + 1;

        const images = await noticeModel.fetchNoticeImages(noticeId);
        const responses = await noticeModel.fetchResponses(noticeId);
        const owner = (await userModel.findUserById(notice.user_id)) || sampleUser;

        res.render("pages/item-detail", {
            notice: normalizeNoticeRow({ ...notice, image_url: "" }),
            images,
            responses,
            owner,
            responseError: null,
            responseSuccess: null
        });
    } catch (error) {
        console.error("DB error, fallback to sample detail:", error.message);
        const fallback = sampleNotices.find((item) => item.id === noticeId) || sampleNotices[0];
        res.render("pages/item-detail", {
            notice: fallback,
            images: fallback ? [{ image_url: fallback.image_url, sort_order: 1 }] : [],
            responses: sampleResponses,
            owner: sampleUser,
            responseError: null,
            responseSuccess: null
        });
    }
}

async function renderMyNotices(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.redirect("/login");
    }

    const activeTab = String(req.query.tab || "posts");

    try {
        const notices = await noticeModel.fetchNoticesByUserId(userId);
        const participations = await noticeModel.fetchParticipationsByUserId(userId);

        const normalized = notices.map(normalizeNoticeRow);
        res.render("pages/my-notices", {
            notices: normalized,
            participations,
            activeTab
        });
    } catch (error) {
        console.error("DB error, fallback to sample my notices:", error.message);
        res.render("pages/my-notices", {
            notices: sampleNotices,
            participations: [],
            activeTab
        });
    }
}

function renderCreateNotice(req, res) {
    res.render("pages/post-notice", {
        isEdit: false,
        notice: null,
        images: []
    });
}

async function renderEditNotice(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.redirect("/login");
    }
    const noticeId = Number(req.params.id);
    try {
        const notice = await noticeModel.fetchNoticeById(noticeId);
        if (!notice) {
            return res.status(404).send("Notice not found.");
        }
        if (notice.user_id !== userId) {
            return res.status(403).send("Unauthorized.");
        }
        const images = await noticeModel.fetchNoticeImages(noticeId);

        res.render("pages/post-notice", {
            isEdit: true,
            notice,
            images
        });
    } catch (error) {
        console.error("Render edit notice failed:", error.message);
        return res.status(500).send("Failed to load notice.");
    }
}

async function createNotice(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.redirect("/login");
    }
    console.log("[Upload] req.files:", req.files);
    console.log("[Upload] req.body:", req.body);
    const { type, title, category, date, location, description } = req.body;
    if (!type || !title || !category || !date || !location || !description) {
        return res.status(400).send("Missing required fields.");
    }
    try {
        const newId = await noticeModel.createNotice({
            user_id: userId,
            type,
            title,
            description,
            category,
            subcategory: null,
            location_text: location,
            occurred_at: date,
            reward_amount: 0
        });

        if (req.files && req.files.length > 0) {
            console.log(`[Upload] Received ${req.files.length} files`);
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = "/uploads/" + req.files[i].filename;
                console.log(`[Upload] Saving image: ${imageUrl}`);
                await noticeModel.createNoticeImage(newId, imageUrl, i + 1);
            }
        } else {
            console.log("[Upload] No files received");
        }

        res.redirect(`/items/${newId}`);
    } catch (error) {
        console.error("Create notice failed:", error.message);
        res.status(500).send("Failed to create notice.");
    }
}

async function updateNotice(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.redirect("/login");
    }

    const noticeId = Number(req.params.id);
    const { type, title, category, date, location, description, status } = req.body;

    if (!noticeId || !type || !title || !category || !date || !location || !description || !status) {
        return res.status(400).send("Missing required fields.");
    }

    try {
        const notice = await noticeModel.fetchNoticeById(noticeId);
        if (!notice) {
            return res.status(404).send("Notice not found.");
        }
        if (notice.user_id !== userId) {
            return res.status(403).send("Unauthorized.");
        }

        await noticeModel.updateNotice(noticeId, {
            type,
            title,
            description,
            category,
            subcategory: null,
            location_text: location,
            occurred_at: date,
            reward_amount: notice.reward_amount || 0,
            status
        });

        if (req.files && req.files.length > 0) {
            await noticeModel.deleteNoticeImages(noticeId);
            for (let i = 0; i < req.files.length; i++) {
                const imageUrl = "/uploads/" + req.files[i].filename;
                await noticeModel.createNoticeImage(noticeId, imageUrl, i + 1);
            }
        }

        return res.redirect(`/items/${noticeId}`);
    } catch (error) {
        console.error("Update notice failed:", error.message);
        return res.status(500).send("Failed to update notice.");
    }
}

async function apiGetNotices(req, res) {
    try {
        const notices = await noticeModel.fetchNotices();
        res.json(notices);
    } catch (error) {
        console.error("API list error:", error.message);
        res.status(500).json({ error: "Failed to load notices." });
    }
}

async function apiGetNotice(req, res) {
    const noticeId = Number(req.params.id);
    try {
        const notice = await noticeModel.fetchNoticeById(noticeId);
        if (!notice) {
            return res.status(404).json({ error: "Notice not found." });
        }
        const images = await noticeModel.fetchNoticeImages(noticeId);
        const responses = await noticeModel.fetchResponses(noticeId);
        res.json({ notice, images, responses });
    } catch (error) {
        console.error("API detail error:", error.message);
        res.status(500).json({ error: "Failed to load notice." });
    }
}

async function apiCreateNotice(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ error: "Authentication required." });
    }
    const { type, title, category, date, location, description } = req.body;
    if (!type || !title || !category || !date || !location || !description) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    try {
        const newId = await noticeModel.createNotice({
            user_id: userId,
            type,
            title,
            description,
            category,
            subcategory: null,
            location_text: location,
            occurred_at: date,
            reward_amount: 0
        });
        res.status(201).json({ id: newId });
    } catch (error) {
        console.error("API create error:", error.message);
        res.status(500).json({ error: "Failed to create notice." });
    }
}

async function apiCreateResponse(req, res) {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ error: "Authentication required." });
    }
    const noticeId = Number(req.params.id);
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }
    try {
        const responseId = await noticeModel.createResponse({
            notice_id: noticeId,
            user_id: userId,
            message
        });

        await noticeModel.updateNoticeStatus(noticeId, "completed");

        res.status(201).json({ id: responseId });
    } catch (error) {
        console.error("API response error:", error.message);
        res.status(500).json({ error: "Failed to send response." });
    }
}

async function createResponseForNotice(req, res) {
    const noticeId = Number(req.params.id);
    const message = String(req.body.message || "").trim();
    const userId = getSessionUserId(req) || null;

    if (!noticeId) {
        return res.status(400).send("Invalid notice id.");
    }
    if (!message) {
        return res.redirect(`/items/${noticeId}`);
    }

    try {
        const notice = await noticeModel.fetchNoticeById(noticeId);
        if (!notice) {
            return res.status(404).send("Notice not found.");
        }

        if (!userId) {
            const images = await noticeModel.fetchNoticeImages(noticeId);
            const responses = await noticeModel.fetchResponses(noticeId);
            const owner = (await userModel.findUserById(notice.user_id)) || sampleUser;

            return res.status(401).render("pages/item-detail", {
                notice: normalizeNoticeRow({ ...notice, image_url: "" }),
                images,
                responses,
                owner,
                responseError: "Please log in to send a response.",
                responseSuccess: null
            });
        }

        await noticeModel.createResponse({
            notice_id: noticeId,
            user_id: userId,
            message
        });

        await noticeModel.updateNoticeStatus(noticeId, "completed");

        return res.redirect(`/items/${noticeId}`);
    } catch (error) {
        console.error("Create response failed:", error.message);
        return res.status(500).send("Failed to send response.");
    }
}

module.exports = {
    renderListings,
    renderNoticeDetail,
    renderMyNotices,
    renderCreateNotice,
    renderEditNotice,
    createNotice,
    updateNotice,
    apiGetNotices,
    apiGetNotice,
    apiCreateNotice,
    apiCreateResponse,
    createResponseForNotice
};