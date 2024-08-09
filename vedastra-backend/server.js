const http = require("http");
const socketIo = require("socket.io");
const app = require("./app"); // Import the Express app
require("dotenv").config();

const server = http.createServer(app); // Create an HTTP server from the Express app
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081", // Your frontend origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
}); // Integrate Socket.io with the server

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room (consultationId)
  socket.on("joinRoom", (consultationId) => {
    socket.join(consultationId);
    console.log(`User ${socket.id} joined room ${consultationId}`);
  });

  // Handle incoming messages
  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
    io.to(data.consultationId).emit("receiveMessage", {
      _id: data._id, // Include _id for the message
      message: data.message,
      senderId: data.sender,
      receiverId: data.receiver,
      senderType: data.senderType, // Include senderType if needed
      receiverType: data.receiverType, // Include receiverType if needed
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
