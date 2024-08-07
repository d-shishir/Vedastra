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
import io from "socket.io-client";
import axiosInstance from "../api/axiosInstance";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { getToken } from "../utils/tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        console.log("Token before sending message:", token); // Debugging log

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

        socket.emit("sendMessage", {
          consultationId,
          message: response.data,
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

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderIdType === "User"
          ? styles.userMessage
          : styles.astrologerMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted // Ensure this matches your layout needs
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
      <View style={styles.buttonContainer}>
        <Button title="End Consultation" onPress={endConsultation} />
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
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    maxWidth: "80%",
    alignSelf: "flex-start", // Default alignment
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
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
});

export default ChatScreen;
