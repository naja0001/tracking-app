import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { database } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function SavedSpotsScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (auth.currentUser) {
          const q = query(
            collection(database, "activities"),
            where("userId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const activitiesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            animatedValue: new Animated.Value(1), // Initialize fade-out value
          }));
          setActivities(activitiesData);
        }
      } catch (error) {
        console.error("Error fetching activities: ", error);
      }
    };

    fetchActivities();
  }, [auth.currentUser]);

  const confirmDeleteActivity = (id, closeRow) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this spot?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            closeRow(); // Close the swipe row when canceling
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteActivity(id);
          },
        },
      ]
    );
  };

  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(database, "activities", id));
      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== id)
      );
    } catch (error) {
      console.error("Error deleting activity: ", error);
    }
  };

  const renderActivity = ({ item }) => {
    let swipeRowRef; // Reference to close the row on Cancel

    const renderRightActions = () => {
      return (
        <View style={styles.swipeBackground}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              confirmDeleteActivity(item.id, () => swipeRowRef.close())
            }
          >
            <Ionicons name="trash-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Swipeable
        ref={(ref) => (swipeRowRef = ref)} // Store the reference to the swipe row
        renderRightActions={renderRightActions}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title || "Untitled Spot"}</Text>
          {item.latitude && item.longitude ? (
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
          ) : (
            <Text style={styles.noPathText}>Location not available</Text>
          )}
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
    marginBottom: 10,
  },
  map: {
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
  },
  noPathText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
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
    backgroundColor: "#ff4d4d", // Red background for delete
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderRadius: 15, // Match card border radius
  },
  deleteButton: {
    width: 75,
    justifyContent: "center",
    alignItems: "center",
  },
});
