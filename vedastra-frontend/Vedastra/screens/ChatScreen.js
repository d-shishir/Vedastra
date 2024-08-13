import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";
import io from "socket.io-client";
import axiosInstance from "../api/axiosInstance";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UUID from "react-native-uuid";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../utils/colors";
import { useFocusEffect } from "@react-navigation/native";

const socket = io("http://192.168.1.64:5000"); // Replace with your actual server URL

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { consultationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [consultationDetails, setConsultationDetails] = useState(null);
  const [chatExists, setChatExists] = useState(false);
  const { userRole, userId, astrologerId } = useAuth();
  const user = {
    _id: userRole === "user" ? userId : astrologerId,
    role: userRole,
  };
  const flatListRef = useRef(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Fetch consultation details
  const fetchConsultationDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/consultations/${consultationId}`
      );
      setConsultationDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching consultation details:", error.message);
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (consultationDetails && consultationDetails.status === "live") {
      try {
        const response = await axiosInstance.get(
          `/chats/${consultationId}/messages`
        );
        setMessages(response.data);
        setChatExists(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setChatExists(false);
          setLoading(false);
        } else {
          console.error("Error fetching messages:", error.message);
          setLoading(false);
        }
      }
    }
  };

  // Set up socket connection and listeners
  const setupSocket = () => {
    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.emit("joinRoom", consultationId);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.emit("leaveRoom", consultationId);
    };
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchConsultationDetails();
      setupSocket();
      fetchMessages();
    }, [consultationId, consultationDetails])
  );

  // Scroll to end after messages are fetched
  React.useEffect(() => {
    if (!loading && consultationDetails?.status === "live") {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

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
        sentMessage._id = UUID.v4();
        sentMessage.senderId = senderId;
        sentMessage.receiverId = receiverId;
        sentMessage.senderType = senderType;
        sentMessage.receiverType = receiverType;

        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setChatExists(true);

        socket.emit("sendMessage", {
          consultationId,
          message: newMessage,
          sender: senderId,
          receiver: receiverId,
          _id: sentMessage._id,
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
      navigation.goBack();
    } catch (error) {
      console.error("Error ending consultation:", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Loading consultation details...</Text>
      </View>
    );
  }

  if (!consultationDetails) {
    return (
      <View style={styles.noConsultationContainer}>
        <Text style={styles.noConsultationText}>
          No consultation details found.
        </Text>
      </View>
    );
  }

  if (consultationDetails.status !== "live") {
    return (
      <View style={styles.noConsultationContainer}>
        <Text style={styles.noConsultationText}>
          Consultation has not started yet.
        </Text>
      </View>
    );
  }

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === user._id;

    if (!item._id || !item.message) {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.navitem}>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            onPress={handleGoBack}
          >
            <Ionicons
              name={"arrow-back-outline"}
              color={colors.primary}
              size={25}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChatProfile", {
                id:
                  userRole === "user"
                    ? consultationDetails.astrologerId
                    : consultationDetails.userId,
                type: userRole === "user" ? "astrologer" : "user",
              })
            }
            style={styles.profileIcon}
          >
            <Icon name="person" size={30} color="#007bff" />
          </TouchableOpacity>
        </View>

        <Button
          title="End Consultation"
          onPress={endConsultation}
          color="#dc3545"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "undefined"}
        style={styles.container}
      >
        {chatExists ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messageList}
          />
        ) : (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.primary,
  },
  profileIcon: {
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: "#007bff",
  },
  noConsultationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noConsultationText: {
    fontSize: 18,
    color: "#007bff",
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMessagesText: {
    fontSize: 18,
    color: "#007bff",
  },
  messageContainer: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    maxWidth: "75%",
  },
  userMessage: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  astrologerMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "white",
  },
  userMessageText: {
    color: "white",
  },
  astrologerMessageText: {
    color: "black",
  },
  messageList: {
    padding: 10,
  },
});

export default ChatScreen;
