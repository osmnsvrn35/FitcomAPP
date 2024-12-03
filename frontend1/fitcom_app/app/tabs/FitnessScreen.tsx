import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons"; // For icons

interface Exercise {
  exercise_id: string;
  name: string;
  body_part: string;
  equipment: string;
  gif_url: string;
  level: string;
  target: string;
  secondary_muscles?: string;
  instructions?: string;
}

const FitnessScreen = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");

  const fetchExercises = async () => {
    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/api/exercises/",
        {
          method: "GET",
          headers: {
            Authorization: "Token f97ba120683067b6f468b1c05db569c00b74ad97",
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: Exercise[] = await response.json();
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filterExercises = (searchText: string, bodyPart: string) => {
    let filtered = [...exercises];

    if (searchText.trim()) {
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (bodyPart && bodyPart !== "all") {
      filtered = filtered.filter(
        (exercise) => exercise.body_part === bodyPart
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
    filterExercises(text, bodyPartFilter);
  };

  const handleBodyPartChange = (value: string) => {
    setBodyPartFilter(value);
    filterExercises(searchValue, value);
  };

  const addToProgram = (exercise: Exercise) => {
    setSelectedExercises((prev) => [...prev, exercise]);
  };

  const saveWorkoutProgram = async () => {
    if (selectedExercises.length === 0) {
      alert("No exercises selected for the workout program.");
      return;
    }

    const workoutProgram = {
      name: programName,
      description: programDescription,
      schedule_ids: selectedExercises.map((exercise) => exercise.exercise_id),

    };

    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/",
        {
          method: "POST",
          headers: {
            Authorization: "Token f97ba120683067b6f468b1c05db569c00b74ad97",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workoutProgram),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Program saved successfully:", responseData);
        alert("Workout program saved successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error saving program:", errorData);
        alert(errorData.message || "Failed to save the workout program.");
      }
    } catch (error) {
      console.error("Error saving program:", error);
      alert("An error occurred while saving the workout program.");
    } finally {
      setModalVisible(false);
      setProgramName("");
      setProgramDescription("");
      setSelectedExercises([]);
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Image
        style={styles.exerciseImage}
        source={{ uri: item.gif_url }}
        resizeMode="contain"
      />
      <Text>Body Part: {item.body_part}</Text>
      <Text>Equipment: {item.equipment}</Text>
      <Text>Level: {item.level}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToProgram(item)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add to Program</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises"
        value={searchValue}
        onChangeText={handleSearchChange}
      />

    <Picker
      selectedValue={bodyPartFilter}
      onValueChange={(value) => {
        console.log(`Selected Body Part: ${value}`); // Debugging log
        handleBodyPartChange(value); // Ensure this function is properly called
      }}
      style={styles.picker}
      >
        <Picker.Item label="All Body Parts" value="all" />
        <Picker.Item label="Back" value="back" />
        <Picker.Item label="Chest" value="chest" />
        <Picker.Item label="Lower Arms" value="lower arms" />
        <Picker.Item label="Lower Legs" value="lower legs" />
        <Picker.Item label="Neck" value="neck" />
        <Picker.Item label="Shoulders" value="shoulders" />
        <Picker.Item label="Upper Arms" value="upper arms" />
        <Picker.Item label="Upper Legs" value="upper legs" />
        <Picker.Item label="Waist" value="waist" />
      </Picker>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.exercise_id}
        renderItem={renderExerciseCard}
      />

      <TouchableOpacity
        style={styles.saveCartButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="cart" size={30} color="#fff" />
        <Text style={styles.saveCartButtonText}>{selectedExercises.length}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalPopup}>
            <Text style={styles.modalTitle}>Your Workout Program</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Program Name"
              value={programName}
              onChangeText={setProgramName}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Program Description"
              value={programDescription}
              onChangeText={setProgramDescription}
              multiline
            />
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={saveWorkoutProgram}
            >
              <Text style={styles.modalSaveButtonText}>Save Program</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent background
  },
  modalPopup: {
    width: "80%", // Adjust width
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalSaveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  saveCartButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "green",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  saveCartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  applyFilterButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  applyFilterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});

export default FitnessScreen;
