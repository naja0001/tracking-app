import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { database } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

export default function SavedSpotsScreen({ navigation, route }) {
  const [activities, setActivities] = useState([]);
  const auth = getAuth();

  // Fetch activities from Firestore and reverse geocode
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (auth.currentUser) {
          const q = query(
            collection(database, "activities"),
            where("userId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);

          const activitiesData = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const data = doc.data();
              let locationName = "Unknown Location";

              try {
                const [reverseGeocode] = await Location.reverseGeocodeAsync({
                  latitude: data.latitude,
                  longitude: data.longitude,
                });

                locationName = `${reverseGeocode.city || reverseGeocode.region}, ${
                  reverseGeocode.country
                }`;
              } catch (error) {
                console.error("Error fetching location name:", error);
              }

              return {
                id: doc.id,
                ...data,
                locationName,
              };
            })
          );

          setActivities(activitiesData);
        }
      } catch (error) {
        console.error("Error fetching activities: ", error);
      }
    };

    fetchActivities();
  }, [auth.currentUser]);

  // Add new spot from AddSpotScreen
  useEffect(() => {
    if (route.params?.newSpot) {
      const newSpot = route.params.newSpot;

      const fetchLocationName = async () => {
        try {
          const [reverseGeocode] = await Location.reverseGeocodeAsync({
            latitude: newSpot.latitude,
            longitude: newSpot.longitude,
          });

          const locationName = `${reverseGeocode.city || reverseGeocode.region}, ${
            reverseGeocode.country
          }`;

          setActivities((prevActivities) => [
            ...prevActivities,
            { ...newSpot, locationName },
          ]);
        } catch (error) {
          console.error("Error fetching location name:", error);
          setActivities((prevActivities) => [
            ...prevActivities,
            { ...newSpot, locationName: "Unknown Location" },
          ]);
        }
      };

      fetchLocationName();
    }
  }, [route.params?.newSpot]);

  // Confirm and delete activity
  const confirmDeleteActivity = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this spot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(database, "activities", id));
            setActivities((prevActivities) =>
              prevActivities.filter((activity) => activity.id !== id)
            );
          } catch (error) {
            console.error("Error deleting activity: ", error);
            Alert.alert("Error", "Could not delete the spot.");
          }
        },
      },
    ]);
  };

  // Render each activity
  const renderActivity = ({ item }) => {
    const renderRightActions = () => (
      <View style={styles.swipeBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteActivity(item.id)}
        >
          <Ionicons name="trash-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title || "Untitled Spot"}</Text>
          <Text style={styles.locationName}>{item.locationName}</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.title || "Untitled Spot"}
            />
          </MapView>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <Text style={styles.noActivitiesText}>No saved spots yet.</Text>
      )}
      <TouchableOpacity
        style={styles.addSpotButton}
        onPress={() => navigation.navigate("AddSpotScreen")}
      >
        <Text style={styles.addSpotText}>Add Spot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f4f8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  locationName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    fontStyle: "italic",
  },
  map: {
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
  },
  noActivitiesText: {
    fontSize: 20,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  addSpotButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
  },
  addSpotText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  swipeBackground: {
    backgroundColor: "#ff4d4d",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderRadius: 15,
  },
  deleteButton: {
    width: 75,
    justifyContent: "center",
    alignItems: "center",
  },
});
