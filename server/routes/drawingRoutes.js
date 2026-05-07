const express = require("express");
const router = express.Router();
const Drawing = require("../models/Drawing");

// GET: Load all drawings for a specific room
router.get("/:roomId", async (req, res) => {
    try {
        const drawings = await Drawing.find({ roomId: req.params.roomId });
        res.json(drawings);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST: Save a new drawing stroke
router.post("/", async (req, res) => {
    try {
        const newDrawing = new Drawing(req.body);
        const savedDrawing = await newDrawing.save();
        res.status(200).json(savedDrawing);
    } catch (err) {
        res.status(500).json(err);
    }
});

// PUT: Update a specific layer's position (Drag & Drop)
router.put("/:roomId/:layerId", async (req, res) => {
    try {
        await Drawing.findOneAndUpdate(
            { roomId: req.params.roomId, layerId: req.params.layerId },
            { $set: { x: req.body.x, y: req.body.y } }
        );
        res.status(200).json({ message: "Position updated" });
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE: Clear all drawings in a room
router.delete("/:roomId", async (req, res) => {
    try {
        await Drawing.deleteMany({ roomId: req.params.roomId });
        res.status(200).json({ message: "Board cleared" });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;