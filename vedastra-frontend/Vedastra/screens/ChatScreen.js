import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from "react-native";
import io from "socket.io-client";
import axiosInstance from "../api/axiosInstance";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UUID from "react-native-uuid"; // Ensure you have react-native-uuid installed
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library

const socket = io("http://192.168.1.64:5000"); // Replace with your actual server URL

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { consultationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [consultationDetails, setConsultationDetails] = useState(null);
  const { userRole, userId, astrologerId } = useAuth();
  const user = {
    _id: userRole === "user" ? userId : astrologerId,
    role: userRole,
  };

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/consultations/${consultationId}`
        );
        setConsultationDetails(response.data);
      } catch (error) {
        console.error("Error fetching consultation details:", error.message);
      }
    };

    fetchConsultationDetails();
  }, [consultationId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(
          `/chats/${consultationId}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [consultationId]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      // console.log("Received message:", message); // Debug received message
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.emit("joinRoom", consultationId);

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", consultationId);
    };
  }, [consultationId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && consultationDetails && user) {
      try {
        const token = await AsyncStorage.getItem("token");

        const senderId = user._id;
        const senderType = user.role === "user" ? "User" : "Astrologer";
        const receiverId =
          senderType === "User"
            ? consultationDetails.astrologerId
            : consultationDetails.userId;
        const receiverType = senderType === "User" ? "Astrologer" : "User";

        const response = await axiosInstance.post(
          `/chats/${consultationId}/messages`,
          {
            message: newMessage,
            senderId,
            receiverId,
            receiverType,
          }
        );

        const sentMessage = response.data;
        sentMessage._id = UUID.v4(); // Generate UUID using react-native-uuid
        sentMessage.senderId = senderId;
        sentMessage.receiverId = receiverId;
        sentMessage.senderType = senderType;
        sentMessage.receiverType = receiverType;

        setMessages((prevMessages) => [...prevMessages, sentMessage]);

        socket.emit("sendMessage", {
          consultationId,
          message: newMessage,
          sender: senderId,
          receiver: receiverId,
          _id: sentMessage._id, // Ensure ID is included
          senderType,
          receiverType,
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error.message);
      }
    }
  };

  const endConsultation = async () => {
    try {
      await axiosInstance.patch(`/consultations/${consultationId}/end`);
      navigation.navigate("AstrologerHomeScreen");
    } catch (error) {
      console.error("Error ending consultation:", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Loading messages...</Text>
      </View>
    );
  }

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === user._id;

    if (!item._id || !item.message) {
      // console.warn("Message missing _id or message text:", item);
      return null;
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.astrologerMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUserMessage
              ? styles.userMessageText
              : styles.astrologerMessageText,
          ]}
        >
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProfileScreen", {
              userId: consultationDetails.userId,
            })
          }
        >
          <Icon name="person" size={30} color="#007bff" />
        </TouchableOpacity>
        <Button
          title="End Consultation"
          onPress={endConsultation}
          color="#dc3545"
        />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id.toString()} // Ensure unique keys
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    backgroundColor: "#ffffff",
  },
  profileIcon: {
    width: 30,
    height: 30,
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
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff", // Bluish color for user messages
  },
  astrologerMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef", // Gray color for received messages
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#ffffff", // White text for user messages
  },
  astrologerMessageText: {
    color: "#333333", // Darker text color for received messages
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
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
