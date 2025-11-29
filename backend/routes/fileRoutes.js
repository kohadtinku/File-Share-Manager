const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const fileController = require('../controllers/fileController');

// ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // unique filename: timestamp-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (adjust if you want)
  fileFilter: function (req, file, cb) {
    // optional: accept all; or restrict by mimetype or extension
    cb(null, true);
  }
});

// POST /api/files/upload
router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);

// GET /api/files/my
router.get('/my', authenticate, fileController.getMyFiles);

// POST /api/files/share/:fileId
router.post('/share/:fileId', authenticate, fileController.shareFile);

router.post("/admin/share/:fileId", authenticate, isAdmin, fileController.adminShareFile);


// GET /api/files/download/:fileId
router.get('/download/:fileId', fileController.downloadFile);

// ADMIN: GET /api/files/all
router.get('/all', authenticate, isAdmin, fileController.adminGetAllFiles);

// ADMIN: DELETE /api/files/:fileId
router.delete('/:fileId', authenticate, isAdmin, fileController.adminDeleteFile);

module.exports = router;
