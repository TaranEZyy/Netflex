import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const loadTimers = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem("timerssll");
        if (storedTimers) {
          setEntries(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error("Error loading timers from AsyncStorage:", error);
      }
    };
    loadTimers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>History of Timers</Text>
      <ScrollView contentContainerStyle={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1, paddingLeft: 10 }]}>Category</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Time</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, paddingRight: 10 }]}>Status</Text>
        </View>
        {entries.map((entry, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableText, { flex: 2, paddingLeft: 10 }]}>{entry.category}</Text>
            <Text style={[styles.tableText, { flex: 2 }]}>{entry.name}</Text>
            <Text style={[styles.tableText, { flex: 2 }]}>{entry.time} sec</Text>
            <Text style={[styles.tableText, { flex: 2, paddingRight: 10 }]}>{entry.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#222",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  tableContainer: {
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute space evenly
    marginBottom: 10,
    backgroundColor: "#444",
    paddingVertical: 10, // Add vertical padding
    paddingHorizontal: 0, // Remove horizontal padding from header container
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute space evenly
    paddingVertical: 10,  // Add vertical padding
    paddingHorizontal: 0, // Remove horizontal padding from row container
    backgroundColor: "#333",
    marginBottom: 5,
    borderRadius: 5,
  },
  tableText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

export default HomeScreen;