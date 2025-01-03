import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function AchievementsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Motivational Image */}
      <Image
        source={require("../assets/motivation.jpg")}
        style={styles.image}
      />
      {/* Motivational Text */}
      <Text style={styles.welcomeText}>
        Velkommen! Begynd din rejse i dag og lås op for spændende mål!
      </Text>
      <Text style={styles.subtext}>
        Tag dine første skridt, og se dine achievements dukke op her.
      </Text>
      {/* Placeholder for locked achievements */}
      <View style={styles.placeholdersContainer}>
        <View style={styles.placeholder}>
          <Image
            source={require("../assets/locked.png")}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderText}>5 km</Text>
        </View>
        <View style={styles.placeholder}>
          <Image
            source={require("../assets/locked.png")}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderText}>10 km</Text>
        </View>
        <View style={styles.placeholder}>
          <Image
            source={require("../assets/locked.png")}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderText}>15 km</Text>
        </View>
      </View>
      {/* Call-to-Action Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TrackActivityScreen")}
      >
        <Text style={styles.buttonText}>Kom i gang nu!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Hvid baggrund
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: "90%", // Gør billedet større og skalerer efter skærmstørrelsen
    height: "50%", // Dynamisk højde
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333", // Mørk tekst
    textAlign: "center",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  placeholdersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  placeholderText: {
    fontSize: 16,
    color: "#757575",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
