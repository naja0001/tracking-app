import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { database } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function SavedSpotsScreen() {
  const [activities, setActivities] = useState([]);

  // Fetch activities from Firestore
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, "activities"));
        const activitiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching activities: ", error);
      }
    };

    fetchActivities();
  }, []);

  // Delete an activity
  const deleteActivity = async (id) => {
    try {
      await deleteDoc(doc(database, "activities", id));
      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== id)
      );
      alert("Activity deleted successfully!");
    } catch (error) {
      console.error("Error deleting activity: ", error);
    }
  };

  const renderActivity = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Activity on {new Date(item.timestamp).toLocaleDateString()}</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: item.path[0]?.latitude || 0,
          longitude: item.path[0]?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline coordinates={item.path} strokeWidth={4} strokeColor="blue" />
      </MapView>
      <Text style={styles.cardText}>Distance: {item.distance} km</Text>
      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteActivity(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
