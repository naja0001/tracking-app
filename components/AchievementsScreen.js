import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function AchievementsScreen({ navigation }) {
  const [distance, setDistance] = useState(0);
  const [achievements, setAchievements] = useState({
    "500m": false,
    "1000m": false,
    "1500m": false,
  });

  const auth = getAuth();

  const fetchAchievements = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid; // Get current user's ID
        const docRef = doc(database, "achievements", userId); // Reference Firestore document
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched data:", data); // Log the fetched data
          setDistance(data.distance || 0);
          console.log("Setting distance state to:", data.distance || 0);
          setAchievements(data.achievements || {});
          console.log("Setting achievements state to:", data.achievements || {});
        } else {
          console.log("No achievements data found for this user.");
        }
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      Alert.alert("Error", "Could not load achievements. Please try again.");
    }
  };
  

  useEffect(() => {
    fetchAchievements();
  }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Velkommen! Sidst har du gået {distance.toFixed(2)} meter!
      </Text>
      <Text style={styles.subtext}>
        Fortsæt med at bevæge dig og lås op for flere mål!
      </Text>
      <View style={styles.placeholdersContainer}>
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
        <View style={styles.placeholder}>
          <Ionicons
            name={achievements["1000m"] ? "checkmark-circle" : "close-circle"}
            size={60}
            color={achievements["1000m"] ? "green" : "gray"}
          />
          <Text style={styles.placeholderText}>
            {achievements["1000m"] ? "1km Achieved!" : "1km"}
          </Text>
        </View>
        <View style={styles.placeholder}>
          <Ionicons
            name={achievements["1500m"] ? "checkmark-circle" : "close-circle"}
            size={60}
            color={achievements["1500m"] ? "green" : "gray"}
          />
          <Text style={styles.placeholderText}>
            {achievements["1500m"] ? "1.5km Achieved!" : "1.5km"}
          </Text>
        </View>
      </View>
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
