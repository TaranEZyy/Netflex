import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Modal,
  Keyboard,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SingleAction = () => {
  const [category, setCategory] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [entries, setEntries] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState("");
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    const toggleTheme = () => {
      setIsDarkTheme((prevTheme) => !prevTheme);
    };

  useEffect(() => {
    const loadTimers = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem("timerss");
        if (storedTimers) {
          setEntries(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error("Error loading timers from AsyncStorage:", error);
      }
    };
    loadTimers();
  }, []);

  useEffect(() => {
    let intervals = [];
    entries.forEach((entry, index) => {
      if (entry.isSubmitted && entry.timer > 0 && !entry.isPaused) {
        const interval = setInterval(() => {
          setEntries((prevEntries) => {
            const updatedEntries = [...prevEntries];
            updatedEntries[index].timer -= 1;
            if (updatedEntries[index].timer === 0) {
              clearInterval(interval);
              updatedEntries[index].status = "Completed";
              updatedEntries[index].isPaused = true;
              // Show the modal with a congratulatory message
              setCompletedTaskName(updatedEntries[index].name);
              setIsModalVisible(true);
            }
            saveTimersToAsyncStorage(updatedEntries); // Save data after each update
            return updatedEntries;
          });
        }, 1000);
        intervals.push(interval);
      }
    });
    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [entries]);

  const saveTimersToAsyncStorage = async (updatedEntries) => {
    try {
      await AsyncStorage.setItem("timerss", JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Error saving timers to AsyncStorage:", error);
    }
  };

  const handleSubmit = () => {
    if (!category || !time || !name) {
      Alert.alert("Error", "All fields are required");
      return;
    }
  
    // Ensure time is a valid number and in seconds (no decimals, positive integer)
    const timeInSeconds = parseInt(time, 10);
    if (isNaN(timeInSeconds) || timeInSeconds <= 0 || time.includes(".")) {
      Alert.alert("Error", "Time must be a valid positive integer (in seconds)");
      return;
    }
  
    const newEntry = {
      category,
      time: timeInSeconds,
      name,
      timer: timeInSeconds,
      isSubmitted: true,
      isPaused: false,
      status: "Running",
    };
  
    setEntries((prevEntries) => {
      const updatedEntries = [...prevEntries, newEntry];
      saveTimersToAsyncStorage(updatedEntries); // Save data after adding a new entry
      return updatedEntries;
    });
  
    setCategory("");
    setTime("");
    setName("");
    Keyboard.dismiss();
  };

  
  
  const handleStart = (globalIndex) => {
    setEntries((prevEntries) => {
      const updatedEntries = [...prevEntries];
      if (updatedEntries[globalIndex].isPaused) {
        updatedEntries[globalIndex].status = "Running";  // Change status to running
        updatedEntries[globalIndex].isPaused = false;   // Resume from the paused state
      }
      saveTimersToAsyncStorage(updatedEntries); // Save data after starting the timer
      return updatedEntries;
    });
  };

  const handlePause = (globalIndex) => {
    setEntries((prevEntries) => {
      const updatedEntries = [...prevEntries];
      updatedEntries[globalIndex].status = "Paused";  // Change status to paused
      updatedEntries[globalIndex].isPaused = true;    // Mark it as paused
      saveTimersToAsyncStorage(updatedEntries); // Save data after pausing the timer
      return updatedEntries;
    });
  };

  const handleReset = (globalIndex) => {
    setEntries((prevEntries) => {
      const updatedEntries = [...prevEntries];
      updatedEntries[globalIndex].timer = updatedEntries[globalIndex].time; // Reset the timer
      updatedEntries[globalIndex].status = "Reset"; // Reset status to paused
      updatedEntries[globalIndex].isPaused = true;   // Mark as paused (even though it's reset)
      saveTimersToAsyncStorage(updatedEntries); // Save data after resetting the timer
      return updatedEntries;
    });
  };

  const renderTimersByCategory = () => {
    const groupedTimers = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    }, {});

    let globalIndex = 0;

    return Object.keys(groupedTimers).map((categoryName) => {
      const timers = groupedTimers[categoryName];
      const isExpanded = expandedCategories.includes(categoryName);

      return (
        <View key={categoryName}>
          <TouchableOpacity
            onPress={() =>
              setExpandedCategories((prev) =>
                prev.includes(categoryName)
                  ? prev.filter((item) => item !== categoryName)
                  : [...prev, categoryName]
              )
            }
            style={styles.categoryHeader}
          >
            <Text style={styles.categoryTitle}>{categoryName}</Text>
          </TouchableOpacity>
          {isExpanded && (
            <View style={styles.timerList}>
              {timers.map((entry, localIndex) => {
                const currentIndex = globalIndex;
                globalIndex++;
                return (
                  <View key={localIndex} style={styles.card}>
                    <Text style={styles.cardText}>Name: {entry.name}</Text>
                    <Text style={styles.cardText}>Time Left: {entry.timer} seconds</Text>
                    <Text style={styles.cardText}>Status: {entry.status}</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={{
                          ...styles.progressBar,
                          width: `${(entry.timer / entry.time) * 100}%`,
                          backgroundColor: entry.timer > 5 ? "#28a745" : "#dc3545",
                        }}
                      />
                    </View>
                    <View style={styles.buttonContainer}>
                      <Button
                        title={"Start"}
                        onPress={() => handleStart(currentIndex)}
                        disabled={entry.status === "Completed"}
                      />
                      <Button
                        title="Pause"
                        onPress={() => handlePause(currentIndex)}
                        disabled={entry.isPaused || entry.status === "Completed"}
                      />
                      <Button
                        title="Reset"
                        onPress={() => handleReset(currentIndex)}
                        disabled={entry.status === "Running"}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDarkTheme ? styles.darkContainer : styles.lightContainer]}>
       {/* <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Text style={styles.themeToggleText}>{isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}</Text>
        </TouchableOpacity> */}
        <View><Text style={{color:"white",fontSize:20}}>Enter activity</Text></View>
      <View style={{ padding: 20 }}>
        <TextInput
           style={[styles.input, isDarkTheme ? styles.darkInput : styles.lightInput]}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
          placeholderTextColor={isDarkTheme ? "white" : "black"}
        />
        <TextInput
          style={[styles.input, isDarkTheme ? styles.darkInput : styles.lightInput]}
          placeholder="Time in seconds"
          value={time}
          onChangeText={setTime}
          keyboardType="numeric"
          placeholderTextColor={isDarkTheme ? "white" : "black"}
        />
        <TextInput
           style={[styles.input, isDarkTheme ? styles.darkInput : styles.lightInput]}
          placeholder="Name of Item"
          value={name}
          onChangeText={setName}
          placeholderTextColor={isDarkTheme ? "white" : "black"}
        />
      </View>
      <TouchableOpacity style={[styles.startButton]} onPress={handleSubmit}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Text style={[isDarkTheme? "white":"black", {fontSize: 20, fontWeight: "900",color:"white"} ]}>ACTIVITY::</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderTimersByCategory()}
      </ScrollView>

      {/* Modal for task completion */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Congratulations!</Text>
            <Text style={styles.modalText}>Task "{completedTaskName}" is completed.</Text>
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 10, borderColor: "gray" },
  startButton: { backgroundColor: "blue", padding: 15, alignItems: "center" },
  startButtonText: { color: "white", fontSize: 18 },
  categoryHeader: { padding: 10, backgroundColor: "#007bff", marginBottom: 10 },
  categoryTitle: { color: "#fff", fontSize: 18 },
  timerList: { padding: 5 },
  card: { marginTop: 10, padding: 20, borderRadius: 12, backgroundColor: "#444" },
  cardText: { color: "#fff", fontSize: 16, marginBottom: 5 },
  progressBarContainer: { height: 8, backgroundColor: "#ccc", borderRadius: 4, marginTop: 5 },
  progressBar: { height: "100%", borderRadius: 4 },
  scrollViewContent: { paddingBottom: 20 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  darkContainer: { backgroundColor: "#121212" },
  lightContainer: { backgroundColor: "#f5f5f5" },
  darkInput: { borderColor: "gray", color: "white" },
  lightInput: { borderColor: "black", color: "black" },
  themeToggle: { padding: 10, backgroundColor: "#007bff", alignItems: "center", marginBottom: 10 },
  themeToggleText: { color: "white", fontSize: 16 },
});

export default SingleAction;



