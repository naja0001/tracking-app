import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { database } from "../firebase";
import * as Location from "expo-location";

export default function TrackActivityScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [tracking, setTracking] = useState(false);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0); // Current session distance
  const [totalDistance, setTotalDistance] = useState(0); // Accumulated distance
  const [achievements, setAchievements] = useState({});
  const locationSubscription = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = doc(database, "achievements", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTotalDistance(data.distance || 0); // Fetch accumulated distance
          setAchievements(data.achievements || {});
        } else {
          console.log("No achievements data found, creating default.");
          await setDoc(docRef, {
            distance: 0,
            achievements: {
              "500m": false,
              "1000m": false,
              "1500m": false,
            },
          });
          setTotalDistance(0);
          setAchievements({ "500m": false, "1000m": false, "1500m": false });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const startTracking = () => {
    setPath([]);
    setDistance(0); // Reset session distance
    setTracking(true);
  };

  const stopTracking = async () => {
    setTracking(false);

    const updatedDistance = totalDistance + distance; // Add session distance to total
    const updatedAchievements = {
      ...achievements,
      "500m": updatedDistance >= 500 || achievements["500m"],
      "1000m": updatedDistance >= 1000 || achievements["1000m"],
      "1500m": updatedDistance >= 1500 || achievements["1500m"],
    };

    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(database, "achievements", userId);
      await setDoc(
        docRef,
        {
          distance: updatedDistance,
          achievements: updatedAchievements,
        },
        { merge: true }
      );

      setTotalDistance(updatedDistance);
      setAchievements(updatedAchievements);
      console.log("Achievements and distance updated in Firestore.");
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }

    navigation.navigate("AchievementsScreen");
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371000; // Radius of Earth in meters
    const dLat = toRadians(point2.latitude - point1.latitude);
    const dLon = toRadians(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(point1.latitude)) *
        Math.cos(toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  useEffect(() => {
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied.");
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        { distanceInterval: 10, accuracy: Location.Accuracy.High },
        (location) => {
          const newPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          if (tracking) {
            setPath((prevPath) => {
              if (prevPath.length > 0) {
                const lastPoint = prevPath[prevPath.length - 1];
                const newDistance = calculateDistance(lastPoint, newPoint);
                setDistance((prevDistance) => prevDistance + newDistance);
              }
              return [...prevPath, newPoint];
            });
          }

          setRegion({
            ...newPoint,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );
    };

    if (tracking) startLocationTracking();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [tracking]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {path.length > 0 && (
          <Polyline coordinates={path} strokeWidth={5} strokeColor="blue" />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Session Distance: {distance.toFixed(2)} meters
        </Text>
        <Text style={styles.infoText}>
          Total Distance: {totalDistance.toFixed(2)} meters
        </Text>
        <View style={styles.buttonContainer}>
          {!tracking ? (
            <Button title="Start Tracking" onPress={startTracking} />
          ) : (
            <Button title="Stop Tracking" onPress={stopTracking} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
