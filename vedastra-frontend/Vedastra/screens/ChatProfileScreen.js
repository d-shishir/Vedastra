import React, { useEffect, useState, useContext } from "react";
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

const ChatProfileScreen = ({ navigation, route }) => {
  const { role } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { id, type } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(2);

  const { userId } = useContext(AuthContext);

  // Ensure that id is a string
  const profileId = typeof id === "object" ? id._id : id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get(
          `auth/profile/${type}/${profileId}`
        );
        setProfileData(response.data);
        // Call fetchReviews after profile data is set
        fetchReviews(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(
          `/astrologers/${profileId}/reviews`
        );
        console.log("API Response:", response.data); // Add this line for debugging
        setReviews(response.data.reviews);
        setReviewsCount(response.data.ratings.reviewsCount);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviewsError(true);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, type]);

  const handleSubmitReview = () => {
    if (rating === 0 || comment.trim() === "") {
      alert("Please provide a rating and comment.");
      return;
    }

    axiosInstance
      .post(`/astrologers/${profileId}/reviews`, {
        astrologerId: profileId,
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

  const {
    name,
    email,
    profilePicture,
    birthdate,
    preferences,
    specializations,
    isAvailable,
    ratings,
  } = profileData;

  // Extract birth time from birthdate
  const birthDateObj = new Date(birthdate);
  const birthTime = birthDateObj.toLocaleTimeString();

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

              {type === "user" && (
                <>
                  <Text style={styles.birthText}>
                    Birthdate:{" "}
                    {birthdate
                      ? new Date(birthdate).toLocaleDateString()
                      : "No birthdate provided"}
                  </Text>
                  <Text style={styles.birthText}>
                    Birth Time: {birthTime || "No birth time provided"}
                  </Text>
                  <Text style={styles.birthText}>
                    Birthplace:{" "}
                    {profileData.birthplace || "No birthplace provided"}
                  </Text>
                  <Text style={styles.preferencesText}>
                    Daily Horoscope:{" "}
                    {preferences?.dailyHoroscope ? "Yes" : "No"}
                  </Text>
                  <Text style={styles.preferencesText}>
                    Personalized Readings:{" "}
                    {preferences?.personalizedReadings ? "Yes" : "No"}
                  </Text>
                </>
              )}

              {type === "astrologer" && (
                <>
                  <Text style={styles.specializationsText}>
                    Specializations:{" "}
                    {specializations?.join(", ") || "No specializations"}
                  </Text>
                  <Text style={styles.availabilityText}>
                    Availability: {isAvailable ? "Available" : "Not Available"}
                  </Text>
                  <Text style={styles.ratingsText}>
                    Average Rating: {ratings?.average || "No ratings"}
                  </Text>
                  <Text style={styles.ratingsText}>
                    Reviews Count: {ratings?.reviewsCount || "No reviews"}
                  </Text>

                  <StarRating
                    rating={rating}
                    onChange={setRating}
                    color={colors.primary}
                  />
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Leave a comment..."
                    value={comment}
                    onChangeText={setComment}
                  />
                  <Button title="Submit Review" onPress={handleSubmitReview} />
                </>
              )}
            </View>
          </>
        }
        data={type === "astrologer" ? reviews : []} // Only display reviews if type is 'astrologer'
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewUser}>{item.userName}</Text>
            <StarRating
              rating={item.rating}
              color={colors.primary}
              starSize={20}
              onChange={setRating}
              disabled
            />
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
        ListFooterComponent={
          type === "astrologer" && reviewsCount > reviews.length ? (
            <TouchableOpacity
              onPress={loadMoreReviews}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>Load More Reviews</Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "start",
    paddingLeft: 10,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoContainer: {
    marginTop: 20,
  },
  nameText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    color: colors.secondary,
    fontFamily: fonts.Light,
    textAlign: "center",
    marginBottom: 10,
  },
  birthText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  preferencesText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  specializationsText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  availabilityText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  ratingsText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    marginTop: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontFamily: fonts.Regular,
  },
  reviewContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  reviewUser: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    marginTop: 5,
  },
  loadMoreButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
  },
  flatListContainer: {
    flexGrow: 1,
  },
});

export default ChatProfileScreen;
