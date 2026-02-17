const mongoose = require("mongoose");

const DrawingSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    layerId: { type: String, required: true },
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: Number,
    height: Number,
    points: [Number], // For pencil lines
    fill: String,
    stroke: String,
    strokeWidth: Number,
}, { timestamps: true });

module.exports = mongoose.model("Drawing", DrawingSchema);