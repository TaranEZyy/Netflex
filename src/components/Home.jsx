import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme !== null) {
        setDarkMode(savedTheme === "dark");
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: darkMode ? "#121212" : "#FFFFFF" }]}
    >
     <TouchableOpacity style={[styles.button, { backgroundColor: "gray" }]} onPress={toggleTheme}>
        <Text style={[darkMode ? styles.buttonText : styles.buttonLightText]}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </Text>
    </TouchableOpacity>

      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: darkMode ? "#007bff" : "#0056b3" }]}
        onPress={() => navigation.navigate("BulkAction")}
      >
        <Text style={styles.buttonText}>Bulk Action</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: darkMode ? "#007bff" : "#0056b3" }]}
        onPress={() => navigation.navigate("History")}  
      >
        <Text style={styles.buttonText}>History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 15,
    width: "80%",
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLightText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  }
});

export default Home;
