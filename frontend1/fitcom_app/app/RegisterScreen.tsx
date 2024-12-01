import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleRegister = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.age ||
      !formData.height ||
      !formData.weight ||
      !formData.gender
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            age: parseInt(formData.age),
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            gender: formData.gender,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        Alert.alert("Success", "Registration successful! Please log in.");
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Registration Failed",
          errorData.message || "Unable to register."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Unable to connect to the server.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={formData.username}
        onChangeText={(value) => handleInputChange("username", value)}
        placeholder="Enter username"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={(value) => handleInputChange("password", value)}
        placeholder="Enter password"
        secureTextEntry
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={formData.age}
        onChangeText={(value) => handleInputChange("age", value)}
        placeholder="Enter age"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={formData.height}
        onChangeText={(value) => handleInputChange("height", value)}
        placeholder="Enter height"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={formData.weight}
        onChangeText={(value) => handleInputChange("weight", value)}
        placeholder="Enter weight"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === "Male" && styles.selectedGenderButton,
          ]}
          onPress={() => handleInputChange("gender", "Male")}
        >
          <Text
            style={[
              styles.genderButtonText,
              formData.gender === "Male" && styles.selectedGenderButtonText,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === "Female" && styles.selectedGenderButton,
          ]}
          onPress={() => handleInputChange("gender", "Female")}
        >
          <Text
            style={[
              styles.genderButtonText,
              formData.gender === "Female" && styles.selectedGenderButtonText,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedGenderButton: {
    backgroundColor: "#1e90ff",
    borderColor: "#1e90ff",
  },
  genderButtonText: {
    color: "#000",
  },
  selectedGenderButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#1e90ff",
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
