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
import { Picker } from "@react-native-picker/picker";
import { useRouter } from 'expo-router';

const RegisterScreen: React.FC = () => {
  const router = useRouter(); // Initialize the router


  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    userLevel: "Sedentary", // Default activity level
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: key === "gender" ? value.toLowerCase() : value, // Convert gender to lowercase
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

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      gender: formData.gender, // Already lowercase
      userLevel: formData.userLevel, // Enum value
    };

    console.log("Payload being sent to server:", payload);

    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
      
        Alert.alert(
          "Success",
          "Registration successful! Please log in.",
          [{ text: "OK", onPress: () => router.replace("/LoginScreen") }] 
        );
      }
       else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
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
        placeholderTextColor="#000"
        placeholder="Enter username"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        placeholder="Enter email"
        placeholderTextColor="#000"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={(value) => handleInputChange("password", value)}
        placeholder="Enter password"
        placeholderTextColor="#000"
        secureTextEntry
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={formData.age}
        onChangeText={(value) => handleInputChange("age", value)}
        placeholder="Enter age"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={formData.height}
        onChangeText={(value) => handleInputChange("height", value)}
        placeholder="Enter height"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={formData.weight}
        onChangeText={(value) => handleInputChange("weight", value)}
        placeholder="Enter weight"
        placeholderTextColor="#000"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === "male" && styles.selectedGenderButton,
          ]}
          onPress={() => handleInputChange("gender", "male")}
        >
          <Text
            style={[
              styles.genderButtonText,
              formData.gender === "male" && styles.selectedGenderButtonText,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData.gender === "female" && styles.selectedGenderButton,
          ]}
          onPress={() => handleInputChange("gender", "female")}
        >
          <Text
            style={[
              styles.genderButtonText,
              formData.gender === "female" && styles.selectedGenderButtonText,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Activity Level</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.userLevel}
          onValueChange={(value) => handleInputChange("userLevel", value)}
          style={styles.picker} // Style for the picker itself
          itemStyle={styles.pickerItemText} // For iOS, applies styles to items
          mode="dropdown" // Or "dialog" depending on preference
        >
          <Picker.Item style={styles.pickerItemText} label="Sedentary" value="Sedentary" />
          <Picker.Item style={styles.pickerItemText} label="Light" value="Light" />
          <Picker.Item style={styles.pickerItemText} label="Moderate" value="Moderate" />
          <Picker.Item style={styles.pickerItemText} label="Active" value="Active" />
          <Picker.Item style={styles.pickerItemText} label="Very Active" value="Very Active" />
          <Picker.Item style={styles.pickerItemText} label="Extra Active" value="Extra Active" />
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    width: "100%",
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
  pickerItemText: {
    fontWeight: "bold",
    color: "#000",
    height:100,

  },
  picker: {
    color: "#000", // Color for the selected value
    fontSize: 16, // Adjust font size
    fontWeight: "bold", // Make text bold
    
  },
});

export default RegisterScreen;
