import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Button,
  ActivityIndicator,
} from "react-native";
import io from "socket.io-client"; // Import socket.io for real-time communication
import axiosInstance from "../api/axiosInstance";
import { useRoute } from "@react-navigation/native";

// Initialize socket connection
const socket = io("http://192.168.1.64:5000"); // Replace with your actual server URL

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { consultationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch previous messages from the chat API
  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/chats/${consultationId}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message using the chat API
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        // Send message via API
        await axiosInstance.post(`chats/${consultationId}/messages`, {
          text: newMessage,
        });

        // Broadcast the message to other clients via Socket.IO
        socket.emit("sendMessage", { consultationId, message: newMessage });
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Handle receiving a new message
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Join the chat room
    socket.emit("joinRoom", consultationId);

    // Clean up on component unmount
    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", consultationId);
    };
  }, [consultationId]);

  // Fetch messages when screen loads
  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Loading messages...</Text>
      </View>
    );
  }

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.astrologerMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  astrologerMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
  },
  messageText: {
    color: "#ffffff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: "#ffffff",
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderColor: "#ced4da",
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default ChatScreen;
