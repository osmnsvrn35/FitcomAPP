import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  Image,
} from "react-native";

const HomeScreen = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [meal, setMeal] = useState({ calories: "", fat: "", carbs: "", protein: "" });
  const [waterLevel, setWaterLevel] = useState(1000); 
  const [nutrition, setNutrition] = useState({
    calories: 1000,
    fat: 50,
    carbs: 100,
    protein: 75,
  });

  const maxNutrition = {
    calories: 3500,
    fat: 100,
    carbs: 200,
    protein: 150,
  };

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
    setWaterLevel((prev) => {
      const newLevel = Math.max(0, Math.min(3000, prev + amount));
      return newLevel;
    });
  };

  const handleInputChange = (key: keyof typeof meal, value: string) => {
    setMeal((prevMeal) => ({ ...prevMeal, [key]: value }));
  };

  const getProgressPercentage = (value: number, max: number) =>
    Math.min((value / max) * 100, 100);

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
      <View style={styles.progressSection}>
        {Object.keys(nutrition).map((key) => (
          <View key={key} style={styles.nutritionItem}>
            <Text>
              {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
              {nutrition[key as keyof typeof nutrition]} / {maxNutrition[key as keyof typeof maxNutrition]}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${getProgressPercentage(
                      nutrition[key as keyof typeof nutrition],
                      maxNutrition[key as keyof typeof maxNutrition]
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Program Section */}
      <View style={styles.programSection}>
        <TouchableOpacity style={styles.programButton}>
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

      {/* Water Tracker Section */}
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

      {/* Add Meal Section */}
      <TouchableOpacity
        style={styles.addMealButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addMealText}>+ Add Meal</Text>
      </TouchableOpacity>

      {/* Modal for Adding Meal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Meal</Text>
            <TextInput
              style={styles.input}
              placeholder="Calories"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("calories", value)}
              value={meal.calories}
            />
            <TextInput
              style={styles.input}
              placeholder="Fat (g)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("fat", value)}
              value={meal.fat}
            />
            <TextInput
              style={styles.input}
              placeholder="Carbs (g)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("carbs", value)}
              value={meal.carbs}
            />
            <TextInput
              style={styles.input}
              placeholder="Protein (g)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("protein", value)}
              value={meal.protein}
            />
            <Button title="Add" onPress={() => setModalVisible(false)} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
    elevation:2,
  },
  programText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  programIcon: {
    width: 40,
    height: 40,
  },
  addMealButton: {
    backgroundColor: "#ff7e5f",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },
  addMealText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});

export default HomeScreen;

