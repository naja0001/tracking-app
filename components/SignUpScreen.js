// SignUpScreen.js
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";

const auth = getAuth(app);

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Successfully signed up");
      navigation.navigate("Dashboard"); // Navigate to Dashboard directly
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already in use. Please try logging in.");
      } else if (err.code === "auth/weak-password") {
        alert("Password is too weak. Please use at least 6 characters.");
      } else {
        alert(err.message);
      }
      console.error("Sign-up error:", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={signUp} />
      <View style={styles.spacer} />
    </View>
  );
};

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

export default SignUpScreen;
