import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useRouter } from "expo-router";

// Define types for user data and workout programs
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

const SettingsScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);


  const router = useRouter();


  useEffect(() => {
    fetchUserData();
    fetchWorkoutPrograms();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "You are not logged in.");
        router.replace("/LoginScreen");
        return;
      }

      console.log(`Fetching user data for user ID: ${userId}...`);
      const response = await fetch(`https://fitcom-9fc3ecf39e06.herokuapp.com/api/users/${userId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User data fetched:", data);
        setUserData(data);
      } else {
        console.error("Failed to fetch user data:", await response.text());
        Alert.alert("Error", "Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching user data.");
    } finally {
      setIsLoading(false);
    }
  };




  const fetchWorkoutPrograms = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "You are not logged in.");
        router.replace("/LoginScreen");
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
      console.error("Error fetching workout programs:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching workout programs.");
    }
  };



  const fetchExercises = async (programId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "You are not logged in.");
        return;
      }

      console.log(`Fetching exercises for program ID: ${programId}`);
      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/${programId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Exercises fetched:", data.schedule);
        setSelectedProgram({ ...data, schedule: data.schedule || [] });
        setExerciseModalVisible(true);
      } else {
        console.error("Failed to fetch exercises:", await response.text());
        Alert.alert("Error", "Failed to fetch exercises.");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching exercises.");
    }
  };

  const selectWorkoutProgram = async (programId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "You are not logged in.");
        return;
      }

      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/users/${userId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selected_program_id: programId }),
        }
      );

      if (response.ok) {
        setSelectedProgramId(programId);
      } else {
        Alert.alert("Error", "Failed to select workout program.");
      }
    } catch (error) {
      console.error("Error selecting workout program:", error);
      Alert.alert("Error", "An unexpected error occurred while selecting the workout program.");
    }
  };


  const renderProgramItem = ({ item }: { item: WorkoutProgram }) => (
    <View style={styles.listItem}>
      <View style={styles.programInfo}>
        <Text style={styles.programName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.programDescription}>{item.description}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => fetchExercises(item.program_id)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectButton,
            selectedProgramId === item.program_id && styles.selectedButton
          ]}
          onPress={() => selectWorkoutProgram(item.program_id)}
        >
          <Text style={styles.selectButtonText}>
            {selectedProgramId === item.program_id ? "Selected" : "Select"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExerciseItem = (exercise: Exercise) => (
    <View key={exercise.exercise_id} style={styles.exerciseCard}>
      <Text style={styles.exerciseTitle}>{exercise.name}</Text>
      {exercise.description && (
        <Text style={styles.exerciseDescription}>Description: {exercise.description}</Text>
      )}
      {exercise.body_part && (
        <Text style={styles.exerciseDescription}>Body Part: {exercise.body_part}</Text>
      )}
      {exercise.equipment && (
        <Text style={styles.exerciseDescription}>Equipment: {exercise.equipment}</Text>
      )}
      {exercise.instructions && (
        <Text style={styles.exerciseInstructions}>
          Instructions: {exercise.instructions.join(". ")}
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


  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("https://fitcom-9fc3ecf39e06.herokuapp.com/auth/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        await AsyncStorage.removeItem("userToken");
        router.replace("/LoginScreen");
        Alert.alert("Success", "You have been logged out.");
      } else {
        Alert.alert("Error", "Failed to log out.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "An unexpected error occurred during logout.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
     {/* Personal Details Section */}
  <View style={styles.personalDetailsSection}>
    <Text style={styles.sectionHeader}>Personal Details</Text>
    {isLoading ? (
      <Text style={styles.loadingText}>Loading user data...</Text>
    ) : userData ? (
      <View style={styles.userDetails}>
        <Text style={styles.userInfoText}>Username: <Text style={styles.userInfoValue}>{userData.username}</Text></Text>
        <Text style={styles.userInfoText}>Email: <Text style={styles.userInfoValue}>{userData.email}</Text></Text>
        <Text style={styles.userInfoText}>Age: <Text style={styles.userInfoValue}>{userData.age}</Text></Text>
        <Text style={styles.userInfoText}>Weight: <Text style={styles.userInfoValue}>{userData.weight} kg</Text></Text>
        <Text style={styles.userInfoText}>Height: <Text style={styles.userInfoValue}>{userData.height} cm</Text></Text>
      </View>
    ) : (
      <Text style={styles.noDataText}>Failed to load user data.</Text>
    )}
  </View>


      {/* Workout Programs Section */}
      <View style={styles.workoutSection}>
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
      </View>
      {/* Modal for Exercises */}
      <Modal visible={exerciseModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedProgram?.name || "Exercises"}
            </Text>
            <ScrollView style={styles.scrollableContent}>
              {selectedProgram?.schedule?.length ? (
                selectedProgram.schedule.map(renderExerciseItem)
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

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  programInfo: {
    marginBottom: 10,
  },

  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollableContent: {
    maxHeight: 300,
    width: "100%",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },

  noDataText:{
    color: "#555",

  },
  userInfoSection: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 15,
  },
  personalDetailsSection: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 15,
  },
  listItem: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  exerciseCard: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f4f4f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exerciseTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#007bff",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#555",
  },
  exerciseInstructions: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    lineHeight: 20,
  },
  exerciseImage: {
    width: "100%", // Full width of the card
    height: 200,   // Fixed height for consistency
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover", // Ensure the image scales proportionally
    backgroundColor: "#f4f4f4", // Optional: Placeholder background color
  },
  userDetails: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "600",
  },
  userInfoValue: {
    fontWeight: "bold",
    color: "#555",
  },
  workoutSection: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
    width: "60%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  programName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  programNameButton: {
    flex: 1,
  },
  programDescription: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    flex: 1,
  },
  selectedButton: {
    backgroundColor: "#45a049",
  },
  selectButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SettingsScreen;
