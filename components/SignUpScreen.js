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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Successfully signed up: " + userCredential.user.uid);
      // Navigate back to login after successful sign-up
      navigation.navigate("Login");
    } catch (err) {
      console.error("Sign-up error:", err.message);
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
