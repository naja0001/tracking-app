import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, Platform } from 'react-native';
import { initializeAuth, getReactNativePersistence, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useEffect, useState } from 'react';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
import { database } from '../firebase';

//web

// emulator

// Auth object
let auth
if (Platform.OS ==='web') {
  auth = getAuth(app)
} else {
auth = initializeAuth(app, {
  Persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
}

export default function LoginScreen({ navigation }) {
  const [enteredEmail, setEnteredEmail] = useState("aja@hotmail.com");
  const [enteredPassword, setEnteredPassword] = useState("123456");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
      } else {
        setUserId(null); // Logged out
      }
    });
    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  async function login() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);
      console.log("Successfully logged in: " + userCredential.user.uid);
      navigation.navigate("Dashboard");
    } catch (err) {
      console.error("Login error:", err.message);
    }
  }

  async function signUp() {
    navigation.navigate("SignUp");
  }

  return (
    <View style={styles.container}>
      {!userId &&
        <>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={enteredEmail}
            onChangeText={setEnteredEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={enteredPassword}
            onChangeText={setEnteredPassword}
          />
          <Button title="Login" onPress={login} />
          
          <View style={styles.spacer} />
          <Button title="Sign Up" onPress={signUp} />
        </>
}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  spacer: {
    height: 10,
  },
});
