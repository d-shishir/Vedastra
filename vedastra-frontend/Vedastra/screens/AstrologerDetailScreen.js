import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Button,
  TextInput,
  FlatList,
} from "react-native";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";
import { SafeAreaView } from "react-native-safe-area-context";
import StarRating from "react-native-star-rating-widget";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const AstrologerDetailScreen = ({ navigation, route }) => {
  const { role, userId } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { id } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(2);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const fetchProfileData = async () => {
    try {
      const response = await axiosInstance.get(`auth/profile/astrologer/${id}`);
      setProfileData(response.data);
      fetchReviews(response.data._id);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (astrologerId) => {
    try {
      const response = await axiosInstance.get(
        `/astrologers/${astrologerId}/reviews`
      );
      setReviews(response.data.reviews);
      setReviewsCount(response.data.ratings.reviewsCount);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = () => {
    if (rating === 0 || comment.trim() === "") {
      alert("Please provide a rating and comment.");
      return;
    }

    axiosInstance
      .post(`/astrologers/${id}/reviews`, {
        astrologerId: id,
        rating,
        comment,
      })
      .then((response) => {
        alert("Review submitted successfully");
        setProfileData((prevData) => ({
          ...prevData,
          ratings: response.data.ratings,
        }));
        setReviews((prevReviews) => [
          ...prevReviews,
          {
            user: userId, // Replace with actual user data
            rating,
            comment,
          },
        ]);
        setRating(0);
        setComment("");
      })
      .catch((error) => {
        console.error(
          "Error submitting review:",
          error.response?.data || error.message
        );
        alert("Failed to submit review. Please try again.");
      });
  };

  const fetchActiveConsultation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (token && userId) {
        // Fetch all consultations
        const response = await axiosInstance.get("/consultations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the user's active consultation with status "live"
        const userLiveConsultations = response.data.filter(
          (consultation) =>
            consultation.userId._id === userId && consultation.status === "live"
        );

        // Assuming you want to display the first live consultation if multiple are found
        setActiveConsultation(userLiveConsultations[0] || null);
      } else {
        throw new Error("Token or user ID is missing.");
      }
    } catch (error) {
      console.error("Fetch active consultation error:", error);
      setError("Failed to fetch active consultation.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      fetchActiveConsultation();
      fetchProfileData();
    }, [])
  );

  const startConsultation = async (astrologerId) => {
    try {
      if (activeConsultation) {
        // If there's an active consultation, navigate to the chat screen
        navigation.navigate("ChatScreen", {
          consultationId: activeConsultation._id,
        });
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("User is not authenticated. Token is missing.");
      }
      if (!astrologerId) {
        throw new Error("Astrologer ID is missing");
      }

      const response = await axiosInstance.post(
        `/consultations/start`,
        { astrologerId, communicationType: "chat" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const consultationId = response.data._id;
      navigation.navigate("ChatScreen", { consultationId });
    } catch (error) {
      console.error(
        "Start consultation error:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to start the consultation.");
    }
  };

  const loadMoreReviews = () => {
    setReviewsCount((prevCount) => prevCount + 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {error ? "Failed to load profile data" : "Profile data not found"}
        </Text>
      </View>
    );
  }

  const { name, email, profilePicture, specializations, isAvailable, ratings } =
    profileData;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <TouchableOpacity
              style={styles.backButtonWrapper}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back-outline"
                color={colors.primary}
                size={25}
              />
            </TouchableOpacity>
            <View style={styles.profilePictureContainer}>
              <Image
                source={{
                  uri: profilePicture || "https://via.placeholder.com/120",
                }}
                style={styles.profilePicture}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{name || "No name provided"}</Text>
              <Text style={styles.emailText}>
                {email || "No email provided"}
              </Text>
              <Text style={styles.specializationsText}>
                Specializations:{" "}
                {specializations?.join(", ") || "No specializations"}
              </Text>
              <Text style={styles.availabilityText}>
                Availability: {isAvailable ? "Available" : "Not Available"}
              </Text>
              <Text style={styles.ratingsText}>
                Average Rating:{" "}
                {ratings?.average ? ratings.average.toFixed(1) : "No ratings"}
              </Text>

              <Text style={styles.ratingsText}>
                Reviews Count: {ratings?.reviewsCount || "No reviews"}
              </Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => startConsultation(profileData._id)}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.chatButtonText}>
                  {activeConsultation &&
                  activeConsultation.astrologerId._id === profileData._id
                    ? "Continue Chat"
                    : "Let's Chat"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewUser}>{item.userName}</Text>
            <StarRating
              rating={item.rating}
              starSize={20}
              disabled={true}
              fullStarColor={colors.primary}
              emptyStarColor={colors.grey}
            />
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
        onEndReached={loadMoreReviews}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          reviewsLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : reviewsError ? (
            <Text style={styles.errorText}>Failed to load more reviews</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          ) : null
        }
      />
      {profileData && activeConsultation && (
        <View style={styles.reviewContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write your review here..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <StarRating
            rating={rating}
            starSize={30}
            onChange={(newRating) => setRating(newRating)} // Update to onChange
            fullStarColor={colors.primary}
            emptyStarColor={colors.grey}
          />

          <Button title="Submit Review" onPress={handleSubmitReview} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButtonWrapper: {
    marginTop: 10,
    marginLeft: 10,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  emailText: {
    fontSize: 18,
    color: colors.secondary,
    marginVertical: 5,
  },
  specializationsText: {
    fontSize: 16,
    marginVertical: 5,
  },
  availabilityText: {
    fontSize: 16,
    marginVertical: 5,
  },
  ratingsText: {
    fontSize: 16,
    marginVertical: 5,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  chatButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 16,
  },
  reviewContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  reviewUser: {
    fontWeight: "bold",
  },
  reviewComment: {
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.red,
  },
  noReviewsText: {
    textAlign: "center",
    color: colors.grey,
  },
});

export default AstrologerDetailScreen;
