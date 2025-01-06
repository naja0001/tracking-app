import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AchievementsScreen({ route, navigation }) {
  // Data from TrackingActivityScreen
  const { distance = 0, achievements = {} } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Motivational Text */}
      <Text style={styles.welcomeText}>
        Velkommen! Du har gået {distance.toFixed(2)} meter!
      </Text>
      <Text style={styles.subtext}>
        Fortsæt med at bevæge dig og lås op for flere mål!
      </Text>
      {/* Achievements Section */}
      <View style={styles.placeholdersContainer}>
        {/* 5,000 meters Achievement */}
        <View style={styles.placeholder}>
          <Ionicons
            name={achievements["500m"] ? "checkmark-circle" : "close-circle"}
            size={60}
            color={achievements["500m"] ? "green" : "gray"}
          />
          <Text style={styles.placeholderText}>
            {achievements["500m"] ? "500 meters Achieved!" : "500 meters"}
          </Text>
        </View>
        {/* 10,000 meters Achievement */}
        <View style={styles.placeholder}>
          <Ionicons
            name={achievements["1km"] ? "checkmark-circle" : "close-circle"}
            size={60}
            color={achievements["1km"] ? "green" : "gray"}
          />
          <Text style={styles.placeholderText}>
            {achievements["1km"] ? "1,000 meters Achieved!" : "1,000 meters"}
          </Text>
        </View>
        {/* 15,000 meters Achievement */}
        <View style={styles.placeholder}>
          <Ionicons
            name={achievements["1500m"] ? "checkmark-circle" : "close-circle"}
            size={60}
            color={achievements["1500m"] ? "green" : "gray"}
          />
          <Text style={styles.placeholderText}>
            {achievements["1500m"] ? "1,500 meters Achieved!" : "1,500 meters"}
          </Text>
        </View>
      </View>
      {/* Call-to-Action Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TrackActivityScreen")}
      >
        <Text style={styles.buttonText}>Kom i gang nu!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  placeholdersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#757575",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
