import { auth } from "../firebase"; // Import auth fra firebase.js
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";

export default function LoginScreen({ navigation }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        navigation.navigate("Dashboard");
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  async function login() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        enteredEmail,
        enteredPassword
      );
      console.log("Successfully logged in:", userCredential.user.uid);
      navigation.navigate("Dashboard");
    } catch (err) {
      console.error("Login error:", err.message);
      alert("Login failed: " + err.message);
    }
  }

  async function signUp() {
    navigation.navigate("SignUp");
  }

  return (
    <View style={styles.container}>
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
