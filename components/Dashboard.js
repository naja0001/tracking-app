import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground, SafeAreaView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase'

const auth = getAuth(app)

const DashboardScreen = ({ navigation }) => {
  const [data, setData] = useState([
    { id: "1", title: "My Adventures", screen: "AdventuresScreen", icon: "compass" },
    { id: "2", title: "Saved Spots", screen: "SavedSpotsScreen", icon: "bookmark" },
    { id: "3", title: "Track Activity", screen: "TrackActivityScreen", icon: "walk" },
    { id: "4", title: "Achievements", screen: "AchievementsScreen", icon: "trophy" },
  ]);

  async function handleLogout() {
    const user = auth.currentUser; // Get the currently signed-in user
    try {  
      await signOut(auth); // Attempt to sign out
      console.log(`Logging out user with ID: ${user.uid}`);
      navigation.navigate("Login"); // Navigate to the login screen
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Ionicons name={item.icon} size={30} color="white" style={styles.cardIcon} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{ uri: "https://images.squarespace-cdn.com/content/v1/5feb6d2cab06677bba637eba/1678905323964-FSN7YA7WOQFDF57T7IQ2/LAM+images+%284%29.jpg" }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Adventure Awaits!</Text>
          <Text style={styles.subText}>Track, Save, and Conquer Your Journeys</Text>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  welcomeContainer: {
    paddingTop: 50,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  subText: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 10,
  },
  listContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 15,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
  },
  cardIcon: {
    marginBottom: 10,
  },
});

export default DashboardScreen;
