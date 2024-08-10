import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import * as DocumentPicker from "expo-document-picker";
import axiosInstance from "../../api/axiosInstance";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

const AstrologerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [document, setDocument] = useState(null);
  const [secureEntry, setSecureEntry] = useState(true);

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
    <SafeAreaView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" color={colors.primary} size={25} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Register as Astrologer</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Name"
            placeholderTextColor={colors.secondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor={colors.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="lock" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor={colors.secondary}
            secureTextEntry={secureEntry}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureEntry((prev) => !prev)}>
            <Ionicons
              name={secureEntry ? "eye-off" : "eye"}
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="list-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Specializations (comma-separated)"
            placeholderTextColor={colors.secondary}
            value={specializations}
            onChangeText={setSpecializations}
          />
        </View>
        <Button title="Upload Document (Optional)" onPress={pickDocument} />
        {document && (
          <Text style={styles.documentInfo}>
            Document: {document.name} ({document.mimeType})
          </Text>
        )}
        <TouchableOpacity
          style={styles.registerButtonWrapper}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.backToLoginWrapper}
          onPress={() => navigation.navigate("AstrologerLogin")}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.gray,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  documentInfo: {
    marginTop: 8,
    fontSize: 16,
    color: colors.secondary,
  },
  registerButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
  },
  registerText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    padding: 10,
  },
  backToLoginWrapper: {
    marginTop: 20,
    backgroundColor: colors.gray,
    borderRadius: 100,
  },
  backToLoginText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    padding: 10,
  },
});

export default AstrologerRegisterScreen;
