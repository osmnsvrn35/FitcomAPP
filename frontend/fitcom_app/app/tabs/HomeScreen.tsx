import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  FlatList,
  Alert,
} from "react-native";
import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Exercise = {
  id: string;
  name: string;
  description: string;
};

type WorkoutProgram = {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
};

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [meal, setMeal] = useState({ calories: "", fat: "", carbs: "", protein: "" });
  const [waterLevel, setWaterLevel] = useState(1000);


  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutProgram | null>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodList, setFoodList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [maxNutrition, setMaxNutrition] = useState({
    calories: 0,
    fat: 0,
    carbs: 0,
    protein: 0,
  });

  const [nutrition, setNutrition] = useState({
    calories: 0,
    fat: 0,
    carbs: 0,
    protein: 0,
  });


  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const adjustWater = (amount: number) => {
    setWaterLevel((prev) => Math.max(0, Math.min(3000, prev + amount)));
  };

  const handleInputChange = (key: keyof typeof meal, value: string) => {
    setMeal((prevMeal) => ({ ...prevMeal, [key]: value }));
  };

  const getProgressPercentage = (current: number, max: number | undefined) => {
    if (!max || max <= 0 || isNaN(current)) return 0;
    const percentage = (current / max) * 100;
    return percentage > 100 ? 100 : percentage;
  };


  const fetchWorkoutProgram = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) {
        Alert.alert("Error", "No token or user ID found. Please log in.");
        return;
      }

      const userResponse = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/users/${userId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!userResponse.ok) {
        const error = await userResponse.json();
        Alert.alert("Error", error.detail || "Failed to fetch user data.");
        return;
      }

      const userData = await userResponse.json();
      const selectedWorkoutId = userData.selected_program_id;

      if (!selectedWorkoutId) {
        Alert.alert("Info", "No workout program selected for this user.");
        return;
      }


      const workoutResponse = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/user-custom-workout-programs/${selectedWorkoutId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (workoutResponse.ok) {
        const workoutData = await workoutResponse.json();
        setSelectedWorkout(workoutData);
        setWorkoutModalVisible(true);
      } else {
        const error = await workoutResponse.json();
        Alert.alert("Error", error.detail || "Failed to fetch workout program details.");
      }
    } catch (error) {
      console.error("Error fetching workout program:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching the workout program.");
    }
  };

  const generateNonce = () => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = Date.now().toString(); // Add timestamp to ensure uniqueness
    for (let i = 0; i < 8; i++) {
      nonce += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return nonce;
  };

  const fetchFoodSuggestions = async (query: string) => {
    if (!query) {
      setFoodList([]);
      return;
    }

    const nonce = generateNonce()
    const timestamp = Math.floor(Date.now() / 1000);

    const consumerKey = "2e7307812ba443c0948b842ee0f23e21";
    const consumerSecret = "f076f0475ec3425c83630d5d3f1fa204";

    const params: Record<string, string> = {
      method: "foods.search",
      search_expression: query,
      format: "json",
      oauth_consumer_key: consumerKey,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp.toString(),
      oauth_nonce: nonce,
      oauth_version: "1.0",
      max_results: '5',
    };

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");

    const baseString = `GET&${encodeURIComponent(
      "https://platform.fatsecret.com/rest/server.api"
    )}&${encodeURIComponent(sortedParams)}`;

    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    const oauthSignature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);

    params.oauth_signature = oauthSignature;

    const apiUrl = `https://platform.fatsecret.com/rest/server.api?${new URLSearchParams(params).toString()}`;
    const proxyUrl = `http://192.168.0.113:8092/proxy?url=${encodeURIComponent(apiUrl)}`;

    try {

      const proxyCheckResponse = await fetch(proxyUrl).catch(() => null);
      if (!proxyCheckResponse || !proxyCheckResponse.ok) {
        throw new Error('Proxy server is not running');
      }

      const controller = new AbortController();

      console.log('Fetching food suggestions...');
      const response = await fetch(proxyUrl, { signal: controller.signal });

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);
        if (result.foods && result.foods.food) {
          setFoodList(Array.isArray(result.foods.food) ? result.foods.food : [result.foods.food]);
        } else {
          setFoodList([]);
        }
      } else {
        console.error("Error response from server:", await response.text());
        setFoodList([]);
      }
    }
    catch (error) {
      console.error("Error fetching food suggestions:", error);
      setFoodList([]);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      fetchFoodSuggestions(query);
    } else {
      setFoodList([]);
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseDescription}>{item.description}</Text>
    </View>
  );

  const renderFoodItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => {
        if (item.food_id) {
          handleFoodSelection(item);
        } else {
          console.error("Invalid item:", item);
          Alert.alert("Error", "Selected food item is invalid.");
        }
      }}
    >
      <Text style={styles.foodName}>{item.food_name}</Text>
      <Text style={styles.foodDescription}>{item.food_description}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const response = await fetch(
        `https://fitcom-9fc3ecf39e06.herokuapp.com/api/users/${userId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );


  console.log(`Response Headers: ${JSON.stringify(response.headers)}`);
      console.log(`token: ${token}`); console.log(`userId: ${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setMaxNutrition({
          calories: userData.kcal_needs || 0,
          fat: userData.fat_needs || 0,
          carbs: userData.carbs_needs || 0,
          protein: userData.protein_needs || 0,
        });



        setNutrition({
          calories: userData.caloriesGoal || 0,
          fat: userData.fatGoal || 0,
          carbs: userData.carbsGoal || 0,
          protein: userData.proteinGoal || 0,
        });

      } else {
        Alert.alert("Error", "Failed to fetch user data.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while fetching user data.");
    }
  };

  const handleFoodSelection = async (item: any) => {
    console.log("Selected Food Item:", item);

    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 16; i++) {
      nonce += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const timestamp = Math.floor(Date.now() / 1000);

    const consumerKey = "2e7307812ba443c0948b842ee0f23e21";
    const consumerSecret = "f076f0475ec3425c83630d5d3f1fa204";

    const params: Record<string, string> = {
      method: "food.get",
      food_id: item.food_id,
      format: "json",
      oauth_consumer_key: consumerKey,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp.toString(),
      oauth_nonce: nonce,
      oauth_version: "1.0",
    };

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");

    const baseString = `GET&${encodeURIComponent(
      "https://platform.fatsecret.com/rest/server.api"
    )}&${encodeURIComponent(sortedParams)}`;

    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    const oauthSignature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);

    params.oauth_signature = oauthSignature;

    const apiUrl = `https://platform.fatsecret.com/rest/server.api?${new URLSearchParams(params).toString()}`;
    const proxyServerAddress = '192.168.0.159';
    const proxyUrl = `http://${proxyServerAddress}:8092/proxy?url=${encodeURIComponent(apiUrl)}`;
    try {
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const result = await response.json();
        console.log("Full API Result:", result);

        const servings = result.food?.servings?.serving;

        if (!servings) {
          Alert.alert("Error", "No serving information found for this food.");
          return;
        }

        // Handle both single and array cases
        const serving = Array.isArray(servings) ? servings[0] : servings;

        // Parse and round values to 1 decimal place
        const calories = parseFloat(serving.calories || "0").toFixed(1);
        const fat = parseFloat(serving.fat || "0").toFixed(1);
        const carbs = parseFloat(serving.carbohydrate || "0").toFixed(1);
        const protein = parseFloat(serving.protein || "0").toFixed(1);

        // Update nutrition state
        setNutrition((prevNutrition) => ({
          calories: Math.min(
            prevNutrition.calories + (parseFloat(calories) || 0),
            maxNutrition.calories || Infinity
          ),
          fat: Math.min(
            prevNutrition.fat + (parseFloat(fat) || 0),
            maxNutrition.fat || Infinity
          ),
          carbs: Math.min(
            prevNutrition.carbs + (parseFloat(carbs) || 0),
            maxNutrition.carbs || Infinity
          ),
          protein: Math.min(
            prevNutrition.protein + (parseFloat(protein) || 0),
            maxNutrition.protein || Infinity
          ),
        }));





        console.log("Updated Nutrition:", {
          calories,
          fat,
          carbs,
          protein,
        });

        Alert.alert(
          "Food Added",
          `${item.food_name} added! (${calories} cal, ${fat}g fat, ${carbs}g carbs, ${protein}g protein)`
        );
      } else {
        const error = await response.json();
        console.error("Error fetching nutritional details:", error);
        Alert.alert("Error", error.message || "Failed to fetch nutritional details.");
      }
    } catch (error) {
      console.error("Error fetching nutritional details:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching nutritional details.");
    }
  };

    const addMealToProgress = () => {
      // Parse input values to numbers (default to 0 if invalid)
      const calories = parseFloat(meal.calories) || 0;
      const fat = parseFloat(meal.fat) || 0;
      const carbs = parseFloat(meal.carbs) || 0;
      const protein = parseFloat(meal.protein) || 0;

      // Update the nutrition progress
      setNutrition((prevNutrition) => ({
        calories: Math.min(
          prevNutrition.calories + calories,
          maxNutrition.calories || Infinity
        ),
        fat: Math.min(
          prevNutrition.fat + fat,
          maxNutrition.fat || Infinity
        ),
        carbs: Math.min(
          prevNutrition.carbs + carbs,
          maxNutrition.carbs || Infinity
        ),
        protein: Math.min(
          prevNutrition.protein + protein,
          maxNutrition.protein || Infinity
        ),
      }));

      // Clear input fields and close the modal
      setMeal({ calories: "", fat: "", carbs: "", protein: "" });
      setMealModalVisible(false);

      // Notify the user
      Alert.alert("Meal Added", "Your meal has been added to today's progress!");
    };

  return (
    <View style={styles.container}>
      {/* Date Section */}
      <View style={styles.dateSection}>
        <TouchableOpacity onPress={() => console.log("Previous Day")}>
          <Text style={styles.navArrow}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.currentDate}>{currentDate}</Text>
        <TouchableOpacity onPress={() => console.log("Next Day")}>
          <Text style={styles.navArrow}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Nutritional Progress Section */}
      {maxNutrition.calories ? (
  <View style={styles.progressSection}>
    {Object.keys(nutrition).map((key) => {
      const currentValue = nutrition[key as keyof typeof nutrition] || 0;
      const maxValue = maxNutrition[key as keyof typeof maxNutrition] || 0;

      console.log(`${key} progress:`, {
        currentValue,
        maxValue,
        percentage: getProgressPercentage(currentValue, maxValue),
      });

      return (
        <View key={key} style={styles.nutritionItem}>
          <Text>
            {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
            {currentValue.toFixed(1)} /{" "}
            {maxValue ? maxValue.toFixed(1) : "N/A"}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage(currentValue, maxValue)}%` },
              ]}
            />
          </View>
        </View>
      );
    })}
  </View>
) : (
  <Text>Loading nutrition data...</Text>
)}




      {/* Program Section */}
      <View style={styles.programSection}>
        <TouchableOpacity style={styles.programButton} onPress={fetchWorkoutProgram}>
          <Text style={styles.programText}>Workout Program</Text>
          <Image
            style={styles.programIcon}
            source={require("../../assets/images/icons/workout-icon.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.programButton}>
          <Text style={styles.programText}>Meal Program</Text>
          <Image
            style={styles.programIcon}
            source={require("../../assets/images/icons/meal.png")}
          />
        </TouchableOpacity>
      </View>

      {/* Add Meal and Add Food Buttons */}
      <View style={styles.addMealContainer}>
        <TouchableOpacity
          style={styles.addMealButton}
          onPress={() => setMealModalVisible(true)} // Opens the meal modal
        >
          <Text style={styles.addMealText}>+ Add Meal</Text>
        </TouchableOpacity>
        <Modal
            visible={mealModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Meal</Text>

                {/* Input fields for meal details */}
                <TextInput
                  style={styles.input}
                  placeholder="Calories"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={meal.calories}
                  onChangeText={(value) => handleInputChange("calories", value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fat (g)"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={meal.fat}
                  onChangeText={(value) => handleInputChange("fat", value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Carbs (g)"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={meal.carbs}
                  onChangeText={(value) => handleInputChange("carbs", value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Protein (g)"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={meal.protein}
                  onChangeText={(value) => handleInputChange("protein", value)}
                />

                {/* Add Meal Button */}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={addMealToProgress} // Add meal to daily progress
                >
                  <Text style={styles.modalButtonText}>Add Meal</Text>
                </TouchableOpacity>

                {/* Close Modal Button */}
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setMealModalVisible(false)} // Close the modal
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


        <TouchableOpacity
          style={[styles.addMealButton, styles.addFoodButton]}

          onPress={() => setFoodModalVisible(true)} // Opens the food suggestions modal
        >
          <Text style={styles.addMealText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>
      {/* Water Tracker */}
      <View style={styles.waterTracker}>
            <Text style={styles.waterAmount}>{`${waterLevel} ml`}</Text>
            <View style={styles.waterGlass}>
              <View
                style={[
                  styles.waterFill,
                  { height: `${(waterLevel / 3000) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.waterButtons}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => adjustWater(-250)}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => adjustWater(250)}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>

      {/* Food Suggestions Modal */}
      <Modal visible={foodModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Food</Text>
            <TextInput
              style={styles.input}
              placeholder="Type food name..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <FlatList
              data={foodList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderFoodItem}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setFoodModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal visible={workoutModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedWorkout ? selectedWorkout.name : "Workout Program"}
            </Text>
            {selectedWorkout && (
              <>
                <Text style={styles.modalDescription}>{selectedWorkout.description}</Text>
                <FlatList
                  data={selectedWorkout.exercises}
                  keyExtractor={(item) => item.id}
                  renderItem={renderExerciseItem}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setWorkoutModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
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
    alignItems: "center",
    padding: 10,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    width: "95%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e90ff",
  },
  currentDate: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  progressSection: {
    marginTop: 20,
    width: "95%",
  },
  nutritionItem: {
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e0e7ec",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1e90ff",
  },
  programSection: {
    marginTop: 20,
    width: "95%",
    alignItems: "center",
  },
  programButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  programText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  programIcon: {
    width: 40,
    height: 40,
  },
  waterTracker: {
    marginTop: 20,
    alignItems: "center",
  },
  waterAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  waterGlass: {
    width: 50,
    height: 100,
    backgroundColor: "#e0e7ec",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#bbb",
    overflow: "hidden",
    position: "relative",
  },
  waterFill: {
    width: "100%",
    backgroundColor: "#1e90ff",
    position: "absolute",
    bottom: 0,
  },
  waterButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },


  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  modalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textAlign: "center", // Optional: Aligns the text to the center
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  foodItem: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e7ec",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  foodDetailsText: {
    fontSize: 12,
    color: "#777",
  },
  foodDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  exerciseItem: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666",
  },
  addMealContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  addMealButton: {
    backgroundColor: "#ff7e5f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addFoodButton: {
    backgroundColor: "#1e90ff",
  },
  addMealText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },closeButton: {
    backgroundColor: "#FF6347",
  },

});

export default HomeScreen;