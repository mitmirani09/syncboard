const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const drawingRoutes = require("./routes/drawingRoutes");


dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON body parsing
app.use("/api/drawings", drawingRoutes);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow connections from anywhere (for now)
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 1. When a user joins a room
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // 2. When a user starts drawing (broadcast to others)
    socket.on("draw_start", (data) => {
        // data = { roomId, layerId, type, color, strokeWidth, x, y }
        socket.to(data.roomId).emit("draw_start", data);
    });

    // 3. When a user moves their mouse (real-time drawing)
    socket.on("draw_move", (data) => {
        // data = { roomId, layerId, newPoints or newWidth/Height }
        socket.to(data.roomId).emit("draw_move", data);
    });

    // 4. When drawing finishes (final save)
    socket.on("draw_end", (data) => {
        // data = { roomId, layerId }
        socket.to(data.roomId).emit("draw_end", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3001, () => {
    console.log("✅ Socket Server running on port 3001");
});