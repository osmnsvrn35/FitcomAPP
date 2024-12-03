import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Switch,
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



  const PersonalDetailsTab = () => {
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    fetchWorkoutPrograms();
  }, []);

  const fetchWorkoutPrograms = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view your workout programs.");
        return;
      }

      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },

        }
      );

      if (response.ok) {
        const data: WorkoutProgram[] = await response.json();
        setWorkoutPrograms(data);
      } else {
        Alert.alert("Error", "Failed to fetch workout programs.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while fetching workout programs.");
    }
  };

  const fetchExercises = async (programId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view exercises.");
        return;
      }

      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/${programId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },

        }
      );

      if (response.ok) {
        const data = await response.json();
        setExercises(data.schedule || []);
        setExerciseModalVisible(true);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to fetch exercises.");
      }
    } catch (error) {
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

  const renderExerciseItem = (exercise: Exercise) => (
    <View key={exercise.exercise_id} style={styles.exerciseCard}>
      <Text style={styles.exerciseTitle}>{exercise.name}</Text>
      {exercise.description && (
        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
      )}
      {exercise.instructions && (
        <Text style={styles.exerciseInstructions}>
          <Text style={styles.instructionsLabel}>Instructions:</Text>{" "}
          {exercise.instructions.join(", ")}
        </Text>
      )}
      {exercise.gif_url && (
        <Image
          source={{ uri: exercise.gif_url }}
          style={styles.exerciseImage}
          resizeMode="contain"
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.tabContainer}>
      <Text style={styles.sectionTitle}>My Workout Plans</Text>
      {workoutPrograms.length > 0 ? (
        <FlatList
          data={workoutPrograms}
          keyExtractor={(item) => item.program_id}
          renderItem={renderProgramItem}
        />
      ) : (
        <Text style={styles.noDataText}>No Workout Plans Found</Text>
      )}

      <Modal visible={exerciseModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedProgram ? selectedProgram.name : "Exercises"}
            </Text>
            <ScrollView style={styles.scrollableContent}>
              {exercises.length > 0 ? (
                exercises.map(renderExerciseItem)
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

const WorkoutProgramsTab = () => {
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWorkoutPrograms();
  }, []);

  const fetchWorkoutPrograms = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view your workout programs.");
        return;
      }

      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: WorkoutProgram[] = await response.json();
        setWorkoutPrograms(data);
      } else {
        Alert.alert("Error", "Failed to fetch workout programs.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while fetching workout programs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchExercises = async (programId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Error", "You are not logged in. Please log in to view exercises.");
        return;
      }

      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/${programId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExercises(data.schedule || []);
        setExerciseModalVisible(true);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to fetch exercises.");
      }
    } catch (error) {
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
      <Text>{item.description}</Text>
      <Text>Level: {item.level}</Text>
    </TouchableOpacity>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWorkoutPrograms();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={workoutPrograms}
        renderItem={renderProgramItem}
        keyExtractor={(item) => item.program_id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.noDataText}>No workout programs available.</Text>
        }
      />
      <Modal
        visible={exerciseModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedProgram?.name} Exercises</Text>
            <ScrollView style={styles.scrollableContent}>
              {exercises.map((exercise) => (
                <View key={exercise.exercise_id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <Text>Body Part: {exercise.body_part}</Text>
                  <Text>Equipment: {exercise.equipment}</Text>
                  {exercise.instructions && (
                    <Text style={styles.exerciseInstructions}>
                      <Text style={styles.instructionsLabel}>Instructions: </Text>
                      {exercise.instructions.join(". ")}
                    </Text>
                  )}
                  {exercise.gif_url && (
                    <Image
                      source={{ uri: exercise.gif_url }}
                      style={styles.exerciseImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
              ))}
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
    </View>
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
          indicatorStyle={styles.tabIndicator}
          style={styles.tabBar}

          tabStyle={styles.tab}
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
  tabBar: {
    backgroundColor: "#ffffff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 15,
    marginTop: 20,
    marginLeft: 16,
  },
  tabIndicator: {
    backgroundColor: "#007bff",
    height: 3,
  },
  tabLabel: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  tab: {
    paddingVertical: 10,
  },
  listItem: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
    fontStyle: "italic",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
    color: "#007bff",
  },
  scrollableContent: {
    width: "100%",
    maxHeight: "60%",
  },
  modalButton: {
    backgroundColor: "#007bff",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007bff",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionsLabel: {
    fontWeight: "bold",
    color: "#007bff",
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default SettingsScreen;