import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { database } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function AddSpotScreen({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [title, setTitle] = useState("");
  const auth = getAuth();

  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleSaveSpot = async () => {
    if (!selectedLocation || !title.trim()) {
      Alert.alert(
        "Missing Information",
        "Please select a location and enter a title."
      );
      return;
    }

    try {
      const newSpot = {
        userId: auth.currentUser.uid,
        title,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        timestamp: new Date(),
      };

      const docRef = await addDoc(collection(database, "activities"), newSpot);

      // Add ID to the new spot
      newSpot.id = docRef.id;

      Alert.alert("Success", "Spot added successfully!");

      // Go back to SavedSpotsScreen with the new spot
      navigation.navigate("SavedSpotsScreen", { newSpot });
    } catch (error) {
      console.error("Error saving spot: ", error);
      Alert.alert("Error", "Could not save the spot. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 55,
          longitude: 12,
          latitudeDelta: 20,
          longitudeDelta: 20,
        }}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Selected Location" />
        )}
      </MapView>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a title for this spot"
          value={title}
          onChangeText={setTitle}
        />
        <Button title="Save Spot" onPress={handleSaveSpot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 3,
  },
  form: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
