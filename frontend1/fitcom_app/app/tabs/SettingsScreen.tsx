import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

// Define Types
type WorkoutProgram = {
  program_id: string;
  name: string;
  description: string;
  level: string;
  schedule: Exercise[];
};

type Exercise = {
  exercise_id: string;
  name: string;
  description: string;
  body_part: string;
  equipment: string;
  gif_url?: string;
  instructions?: string[];
};

// Personal Details Tab
const PersonalDetailsTab = () => (
  <ScrollView style={styles.tabContainer}>
    <FlatList
      data={[
        { id: "1", title: "Name: John Doe" },
        { id: "2", title: "Age: 30" },
        { id: "3", title: "Email: john.doe@example.com" },
      ]}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>{item.title}</Text>
        </View>
      )}
    />
  </ScrollView>
);

// Workout Programs Tab
const WorkoutProgramsTab = () => {
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    fetchWorkoutPrograms();
  }, []);

  // Fetch workout programs
  const fetchWorkoutPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/",
        {
          headers: {
            Authorization: "Token 111a1750f9c1d350bd68aba2ffebc430d5dedefc",
          },
        }
      );

      if (response.ok) {
        const data: WorkoutProgram[] = await response.json();
        setWorkoutPrograms(data);
      } else {
        const errorData = await response.json();
        console.error("Error fetching workout programs:", errorData);
        Alert.alert("Error", "Failed to fetch workout programs.");
      }
    } catch (error) {
      console.error("Error fetching workout programs:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching workout programs.");
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Fetch exercises for a program
  const fetchExercises = async (programId: string) => {
    try {
      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/${programId}/`,
        {
          headers: {
            Authorization: "Token 111a1750f9c1d350bd68aba2ffebc430d5dedefc",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExercises(data.schedule || []);
        setExerciseModalVisible(true);
      } else {
        const errorData = await response.json();
        console.error("Error fetching exercises:", errorData);
        Alert.alert("Error", errorData.detail || "Failed to fetch exercises.");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching exercises.");
    }
  };

  const renderProgramItem = ({ item }: { item: WorkoutProgram }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setSelectedProgram(item);
        fetchExercises(item.program_id);
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.name}</Text>
      {item.description && <Text style={styles.exerciseDescription}>{item.description}</Text>}
      {item.instructions && (
        <Text style={styles.exerciseDescription}>
          Instructions: {item.instructions.join(", ")}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.tabContainer}>
      {loadingPrograms ? (
        <Text>Loading...</Text>
      ) : workoutPrograms.length > 0 ? (
        <FlatList
          data={workoutPrograms}
          keyExtractor={(item) => item.program_id}
          renderItem={renderProgramItem}
        />
      ) : (
        <Text style={styles.noDataText}>No Workout Plans Found</Text>
      )}

      {/* Modal for Exercises */}
      <Modal visible={exerciseModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedProgram ? selectedProgram.name : "Exercises"}
            </Text>
            <ScrollView style={styles.scrollableContent}>
              {exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <View key={exercise.exercise_id} style={styles.listItem}>
                    <Text style={styles.listItemText}>{exercise.name}</Text>
                    {exercise.description && (
                      <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                    )}
                    {exercise.instructions && (
                      <Text style={styles.exerciseDescription}>
                        Instructions: {exercise.instructions.join(", ")}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No exercises found.</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setExerciseModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const SettingsScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "personalDetails", title: "Personal Details" },
    { key: "workoutPrograms", title: "My Workout" },
  ]);

  const renderScene = SceneMap({
    personalDetails: PersonalDetailsTab,
    workoutPrograms: WorkoutProgramsTab,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: "blue" }}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  listItem: {
    padding: 10, 
    marginBottom: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  listItemText: {
    fontSize: 16,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#555",
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%", 
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    overflow: "hidden", 
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollableContent: {
    width: "100%",
    maxHeight: "60%", 
    paddingHorizontal: 10, 
  },
  
});

export default SettingsScreen;
