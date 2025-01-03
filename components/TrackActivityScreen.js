import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { collection, addDoc } from "firebase/firestore";
import * as Location from "expo-location";
import { database } from "../firebase";

export default function TrackActivityScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [tracking, setTracking] = useState(false);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);

  const mapView = useRef(null);
  const locationSubscription = useRef(null);

  useEffect(() => {
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied.");
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          distanceInterval: 10,
          accuracy: Location.Accuracy.High,
        },
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

          if (mapView.current) {
            mapView.current.animateToRegion({
              ...newPoint,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [tracking]);

  const calculateDistance = (point1, point2) => {
    const R = 6371000;
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

  const startTracking = () => {
    setPath([]);
    setDistance(0);
    setTracking(true);
  };

  const stopTracking = async () => {
    setTracking(false);

    try {
      await addDoc(collection(database, "activities"), {
        path: path,
        distance: distance,
        timestamp: new Date().toISOString(),
      });
      console.log("Activity saved to Firestore.");
    } catch (error) {
      console.error("Error saving activity: ", error);
    }

    // Navigate to AchievementsScreen with activity data
    navigation.navigate("AchievementsScreen", {
      activityData: { distance: distance },
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} ref={mapView}>
        {path.length > 0 && (
          <Polyline coordinates={path} strokeWidth={5} strokeColor="blue" />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Distance: {distance.toFixed(0)} meters
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
