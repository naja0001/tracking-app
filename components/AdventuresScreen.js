import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { storage, database } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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

  // Overvåg brugerens login-status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Sæt bruger-ID
      } else {
        setUserId(null); // Ryd brugerdata ved logout
        setAdventures([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Hent brugerens eventyr fra Firestore
  useEffect(() => {
    if (!userId) return;

    const userAdventuresRef = collection(
      database,
      `users/${userId}/adventures`
    );
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

  // Kamera-adgang og billedoptagelse
  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Adgang nægtet",
          "Du skal give kamera-adgang for at tage billeder."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setImagePath(result.assets[0].uri);
        setShowUploadOptions(true);
      }
    } catch (error) {
      console.error("Fejl ved åbning af kamera: ", error);
      Alert.alert("Fejl", "Kunne ikke åbne kamera.");
    }
  };

  // Galleri-adgang og billedvalg
  const launchImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Adgang nægtet",
          "Du skal give tilladelse til at få adgang til galleriet."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
      });

      if (!result.canceled) {
        setImagePath(result.assets[0].uri);
        setShowUploadOptions(true);
      }
    } catch (error) {
      console.error("Fejl ved åbning af galleri: ", error);
      Alert.alert("Fejl", "Kunne ikke åbne galleri.");
    }
  };

  // Upload eventyr til Firebase Storage og Firestore
  const uploadAdventure = async () => {
    if (!imagePath || !text) {
      Alert.alert("Manglende data", "Vælg et billede og skriv en tekst.");
      return;
    }

    try {
      const res = await fetch(imagePath);
      const blob = await res.blob();
      const fileName = `images/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const userAdventuresRef = collection(
        database,
        `users/${userId}/adventures`
      );
      await addDoc(userAdventuresRef, {
        image: downloadURL,
        text,
        storagePath: fileName,
        timestamp: new Date().toISOString(),
      });

      setImagePath(null);
      setText("");
      setShowUploadOptions(false);
    } catch (error) {
      console.error("Fejl ved upload: ", error);
      Alert.alert("Upload Fejl", "Kunne ikke uploade eventyret.");
    }
  };

  const renderAdventure = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardText}>{item.text}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAdventure(item.id, item.storagePath)}
      >
        <Icon name="delete" size={20} color="red" />
        <Text style={styles.buttonText}>Slet</Text>
      </TouchableOpacity>
    </View>
  );

  const deleteAdventure = async (id, storagePath) => {
    try {
      const docRef = doc(database, `users/${userId}/adventures`, id);
      await deleteDoc(docRef);
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Fejl ved sletning: ", error);
      Alert.alert("Slet Fejl", "Kunne ikke slette eventyret.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={launchImagePicker}>
        <Icon name="photo-library" size={20} color="black" />
        <Text style={styles.buttonText}>Vælg billede</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={launchCamera}>
        <Icon name="camera-alt" size={20} color="black" />
        <Text style={styles.buttonText}>Tag billede</Text>
      </TouchableOpacity>

      {showUploadOptions && (
        <View style={styles.uploadOptionsContainer}>
          {imagePath && (
            <Image style={styles.previewImage} source={{ uri: imagePath }} />
          )}
          <TextInput
            style={styles.input}
            placeholder="Skriv noget..."
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadAdventure}
          >
            <Icon name="cloud-upload" size={20} color="black" />
            <Text style={styles.buttonText}>Upload Eventyr</Text>
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
  },
});
