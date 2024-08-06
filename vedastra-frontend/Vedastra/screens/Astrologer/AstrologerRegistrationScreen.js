import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axiosInstance from "../../api/axiosInstance";

const AstrologerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [document, setDocument] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !specializations) {
      return Alert.alert("Error", "Please fill in all fields.");
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append(
        "specializations",
        specializations.split(",").map((spec) => spec.trim())
      );

      if (document) {
        formData.append("document", {
          uri: document.uri,
          type: document.mimeType,
          name: document.name,
        });
      }

      const response = await axiosInstance.post(
        "/astrologers/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Astrologer registered successfully");
      navigation.navigate("AstrologerLogin");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to register astrologer");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
      });

      if (result.type === "success") {
        if (result.uri && result.mimeType && result.name) {
          setDocument(result);
        } else {
          Alert.alert("Error", "Document properties are missing");
        }
      } else {
        Alert.alert("Info", "Document selection was cancelled");
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", `Failed to pick document: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register as Astrologer</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Specializations (comma-separated)"
        placeholderTextColor="#888"
        value={specializations}
        onChangeText={setSpecializations}
      />
      <Button title="Upload Document (Optional)" onPress={pickDocument} />
      {document && (
        <Text style={styles.documentInfo}>
          Document: {document.name} ({document.mimeType})
        </Text>
      )}
      <Button title="Register" onPress={handleRegister} color="#007bff" />
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate("AstrologerLogin")}
        color="#6c757d"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentInfo: {
    marginTop: 8,
    fontSize: 16,
    color: "#343a40",
  },
});

export default AstrologerRegisterScreen;
