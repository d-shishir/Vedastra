import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatScreen = ({ route }) => {
  const { consultationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initiateSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      const socketInstance = io("http://localhost:5000", {
        auth: {
          token,
        },
      });

      socketInstance.on("connect", () => {
        console.log("Connected to chat server");
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from chat server");
      });

      socketInstance.on("newMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      setSocket(socketInstance);
    };

    initiateSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socket.emit("sendMessage", { consultationId, content: newMessage });
    setNewMessage("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: "#343a40",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ced4da",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default ChatScreen;
