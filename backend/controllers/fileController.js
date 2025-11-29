const File = require('../models/File');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const file = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: `uploads/${req.file.filename}`,   // FIXED
            mimetype: req.file.mimetype,
            size: req.file.size,
            owner: req.user._id,
            sharedWith: []
        });

        res.json({ message: 'File uploaded', file });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};

exports.getMyFiles = async (req, res) => {
    try {
        const userId = req.user._id;
        // files that user owns OR files shared with user
        const files = await File.find({
            $or: [{ owner: userId }, { sharedWith: userId }]
        }).populate('owner', 'username role').sort({ createdAt: -1 });

        res.json({ files });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch files', error: err.message });
    }
};

exports.shareFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { usernameToShare } = req.body;

        if (!usernameToShare) return res.status(400).json({ message: 'usernameToShare required' });

        const file = await File.findById(fileId);
        if (!file) return res.status(404).json({ message: 'File not found' });

        // only owner or admin can share
        if (!file.owner.equals(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'not allowed to share this file' });
        }

        const userToShare = await User.findOne({ username: usernameToShare });
        if (!userToShare) return res.status(404).json({ message: 'User to share not found' });

        // avoid duplicates
        if (file.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ message: 'File already shared with this user' });
        }

        file.sharedWith.push(userToShare._id);
        await file.save();

        res.json({ message: `File shared with ${userToShare.username}`, file });
    } catch (err) {
        res.status(500).json({ message: 'Share failed', error: err.message });
    }
};


exports.downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        // 1) Read and decode token
        let rawToken = req.query.token;
        if (!rawToken) {
            return res.status(401).json({ message: "Token missing" });
        }

        const token = decodeURIComponent(rawToken.trim());

        // 2) Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.log("JWT ERROR:", err);
            return res.status(401).json({ message: "Invalid token" });
        }

        const userId = decoded.id;

        // 3) Get file
        const file = await File.findById(fileId).populate("owner");
        if (!file) return res.status(404).json({ message: "File not found" });

        // 4) Check access
        const isOwner = file.owner._id.equals(userId);
        const isShared = file.sharedWith.map(String).includes(userId);
        const isAdmin = decoded.role === "admin";

        if (!isOwner && !isShared && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // 5) Build absolute path
        // const filePath = path.join(__dirname, "..", file.path);
        const filePath = path.resolve(file.path);

        console.log("DB PATH:", file.path);
        console.log("ABSOLUTE PATH:", filePath);


        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File missing on server" });
        }

        return res.download(filePath, file.originalName);

    } catch (err) {
        console.log("ERROR:", err);
        return res.status(500).json({ message: "Download error", error: err.message });
    }
};

exports.adminGetAllFiles = async (req, res) => {
    try {
        const files = await File.find().populate('owner', 'username role').sort({ createdAt: -1 });
        res.json({ files });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch files', error: err.message });
    }
};

exports.adminDeleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        // 1. Find the file in DB
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found in DB" });
        }

        // 2. Build full absolute path
        const absolutePath = path.join(__dirname, "..", file.path);

        console.log("Trying to delete:", absolutePath);

        // 3. Delete the file from disk IF exists
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log("File removed from disk");
        } else {
            console.log("File missing on disk, skipping unlink");
        }

        // 4. Delete from database
        await File.findByIdAndDelete(fileId);

        return res.json({ message: "File deleted successfully" });
    } catch (err) {
        console.error("❌ ERROR WHILE DELETING FILE:", err);
        return res.status(500).json({
            message: "Delete failed",
            error: err.message,
        });
    }
};



exports.adminShareFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { usernameToShare } = req.body;

    if (!usernameToShare) {
      return res.status(400).json({ message: "usernameToShare required" });
    }

    // Admin must be the one sharing
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can share files" });
    }

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const userToShare = await User.findOne({ username: usernameToShare });
    if (!userToShare)
      return res.status(404).json({ message: "User to share not found" });

    // avoid duplicates
    if (file.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ message: "Already shared with this user" });
    }

    file.sharedWith.push(userToShare._id);
    await file.save();

    res.json({
      message: `ADMIN shared file with ${userToShare.username}`,
      file,
    });
  } catch (err) {
    res.status(500).json({ message: "Admin share failed", error: err.message });
  }
};
