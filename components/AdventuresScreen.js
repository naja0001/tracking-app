import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, FlatList, TextInput, Text, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { storage, database } from "../firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function AdventuresScreen() {
  const [imagePath, setImagePath] = useState(null);
  const [text, setText] = useState("");
  const [adventures, setAdventures] = useState([]);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [userId, setUserId] = useState(null);

  // Monitor authentication state and set userId
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set user ID on login
      } else {
        setUserId(null); // Clear user ID on logout
        setAdventures([]); // Clear adventures when user logs out
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch adventures for the logged-in user in real-time
  useEffect(() => {
    if (!userId) return;

    const userAdventuresRef = collection(database, `users/${userId}/adventures`);
    const q = query(userAdventuresRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAdventures = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isEditing: false,
        updatedText: doc.data().text,
      }));
      setAdventures(fetchedAdventures);
    });

    return () => unsubscribe();
  }, [userId]);

  // Launch Image Picker
  async function launchImagePicker() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImagePath(result.assets[0].uri);
      setShowUploadOptions(true);
    }
  }

  async function launchCamera() {
    const result = await ImagePicker.requestCameraPermissionsAsync();

    if (!result.granted) {
      alert("Camera access not provided");
    } else {
      ImagePicker.launchCameraAsync({
        quality: 1,
      })
        .then((response) => {
          if (!response.canceled) {
            setImagePath(response.assets[0].uri);
          }
        })
        .catch((error) => alert("Error launching camera"));
    }
  }

  // Upload Adventure
  async function uploadAdventure() {
    if (!imagePath || !text) {
      alert("Please select an image and enter text.");
      return;
    }

    try {
      const res = await fetch(imagePath);
      const blob = await res.blob();
      const fileName = `images/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const userAdventuresRef = collection(database, `users/${userId}/adventures`);
      await addDoc(userAdventuresRef, {
        image: downloadURL,
        text: text,
        storagePath: fileName,
        timestamp: new Date().toISOString(),
      });

      setImagePath(null);
      setText("");
      setShowUploadOptions(false);
    } catch (error) {
      console.error("Error uploading adventure: ", error);
      alert("Failed to upload adventure.");
    }
  }

  // Delete Adventure
  async function deleteAdventure(id, storagePath) {
    try {
      const docRef = doc(database, `users/${userId}/adventures`, id);
      await deleteDoc(docRef);
      await deleteObject(ref(storage, storagePath));
    } catch (error) {
      console.error("Error deleting adventure: ", error);
      alert("Failed to delete adventure.");
    }
  }

  const renderAdventure = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardText}>{item.text}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAdventure(item.id, item.storagePath)}
      >
        <Icon name="delete" size={20} color="black" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={launchImagePicker}>
        <Icon name="photo-library" size={20} color="black" />
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={launchCamera}>
        <Icon name="camera-alt" size={20} color="black" />
        <Text style={styles.buttonText}>Use Camera</Text>
      </TouchableOpacity>

      {showUploadOptions && (
        <View style={styles.uploadOptionsContainer}>
          {imagePath && (
            <Image style={styles.previewImage} source={{ uri: imagePath }} />
          )}
          <TextInput
            style={styles.input}
            placeholder="Write something..."
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.uploadButton} onPress={uploadAdventure}>
            <Icon name="cloud-upload" size={20} color="black" />
            <Text style={styles.buttonText}>Upload Adventure</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={adventures}
        renderItem={renderAdventure}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  list: {
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    justifyContent: "center",
  },
  uploadOptionsContainer: {
    marginTop: 20,
    alignItems: "center",
  }
});
