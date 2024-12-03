import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  TabLayout: undefined;
};

interface LoginScreenProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(
        "https://fitcom-9fc3ecf39e06.herokuapp.com/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        setIsLoggedIn(true); // Set the login state
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Login Failed",
          errorData.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Unable to connect to the server.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => handleInputChange("password", value)}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>Don't have an account? Register here</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLink: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
  },
});

export default LoginScreen;
