import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../contexts/AuthContext";
import { colors } from "../utils/colors";

const { width, height } = Dimensions.get("window");

const Star = ({ x, y, size, duration }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          opacity: opacity,
        },
      ]}
    />
  );
};

const OnboardingScreen = ({ navigation }) => {
  const { setRole } = useContext(AuthContext);
  const nebulaX = useRef(new Animated.Value(0)).current;
  const nebulaY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateNebula = () => {
      Animated.parallel([
        Animated.timing(nebulaX, {
          toValue: Math.random() * width - width / 2,
          duration: 30000,
          useNativeDriver: false,
        }),
        Animated.timing(nebulaY, {
          toValue: Math.random() * height - height / 2,
          duration: 30000,
          useNativeDriver: false,
        }),
      ]).start(() => animateNebula());
    };
  }, []);

  const handleRoleSelection = async (role) => {
    await setRole(role);
    navigation.navigate(role === "user" ? "UserStack" : "AstrologerStack");
  };

  const stars = Array(50)
    .fill()
    .map((_, i) => (
      <Star
        key={i}
        x={Math.random() * width}
        y={Math.random() * height}
        size={Math.random() * 2 + 1}
        duration={Math.random() * 2000 + 1000}
      />
    ));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#2C3E50", "#000000"]}
        style={styles.gradient}
      >
        {stars}
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/vedastra.png")}
            style={{ width: 150, height: 70 }}
          />
          <Text style={styles.header}>Welcome to Vedastra!</Text>
        </View>
        <Text style={styles.subHeader}>Select Your Role</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("user")}
        >
          <Text style={styles.buttonText}>I am a User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("astrologer")}
        >
          <Text style={styles.buttonText}>I am an Astrologer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  star: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 50,
  },
  nebula: {
    position: "absolute",
    width: width * 2,
    height: height * 2,
    borderRadius: width,
    backgroundColor: "rgba(128, 0, 128, 0.1)",
    shadowColor: "#800080",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 200,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: colors.white,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 30,
    fontFamily: "Roboto-Regular",
    color: colors.white,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Roboto-Bold",
  },
});

export default OnboardingScreen;
