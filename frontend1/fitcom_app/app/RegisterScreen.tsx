import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    activityLevel: "",
    gender: "",
  });

  const activityLevels = [
    "Select Activity Level",
    "BMR",
    "Sedentary: little or no exercise",
    "Light exercise: 1-3 times/week",
    "Moderate exercise: 4-5 times/week",
    "Daily exercise or intense exercise 3-4 times/week",
    "Very Active: intense exercise 6-7 times/week",
    "Extra Active: very intense exercise daily, or physical job",
  ];

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleRegister = () => {
    console.log("Registering user:", formData);
    
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={formData.username}
        onChangeText={(value) => handleInputChange("username", value)}
        placeholder="Enter username"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={(value) => handleInputChange("password", value)}
        placeholder="Enter password"
        secureTextEntry
      />

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.input}
        value={formData.age}
        onChangeText={(value) => handleInputChange("age", value)}
        placeholder="Enter age"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm):</Text>
      <TextInput
        style={styles.input}
        value={formData.height}
        onChangeText={(value) => handleInputChange("height", value)}
        placeholder="Enter height"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg):</Text>
      <TextInput
        style={styles.input}
        value={formData.weight}
        onChangeText={(value) => handleInputChange("weight", value)}
        placeholder="Enter weight"
        keyboardType="numeric"
      />

      {/* Activity Level */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Activity Level:</Text>
        <Picker
          selectedValue={formData.activityLevel}
          onValueChange={(value: string) => handleInputChange("activityLevel", value)}
          style={styles.picker}
        >
          {activityLevels.map((level, index) => (
            <Picker.Item key={index} label={level} value={level} />
          ))}
        </Picker>
      </View>

      {/* Gender */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Gender:</Text>
        <Picker
          selectedValue={formData.gender}
          onValueChange={(value: string) => handleInputChange("gender", value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  registerButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
