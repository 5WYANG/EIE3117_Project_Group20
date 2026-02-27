const express = require("express");
const noticeController = require("../controllers/noticeController");

const router = express.Router();

router.get("/notices", noticeController.apiGetNotices);
router.get("/notices/:id", noticeController.apiGetNotice);
router.post("/notices", noticeController.apiCreateNotice);
router.post("/notices/:id/responses", noticeController.apiCreateResponse);

module.exports = router;
