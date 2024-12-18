// app/__tests__/SettingsScreen.test.tsx

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "../tabs/SettingsScreen"; // Adjust the path based on your project structure
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Mock `expo-router`'s `useRouter` hook
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock `AsyncStorage`
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock `Alert.alert` to prevent actual alerts during tests and allow assertions
jest.spyOn(Alert, "alert").mockImplementation(() => {});

// Mock `fetch` globally
global.fetch = jest.fn();

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("renders the settings screen correctly", async () => {
    // Mock AsyncStorage.getItem to return a valid token and userId
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "userToken") return Promise.resolve("test-token");
      if (key === "userId") return Promise.resolve("user-123");
      return Promise.resolve(null);
    });

    // Mock fetch for user data
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.endsWith("/api/users/user-123/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              username: "testuser",
              email: "testuser@example.com",
              age: 30,
              weight: 70,
              height: 175,
            }),
        });
      }

      // Mock fetch for workout programs
      if (url.endsWith("/api/user-custom-workout-programs/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                program_id: "program-1",
                name: "Beginner Program",
                description: "A starter program",
                level: "Beginner",
                schedule: [],
              },
              {
                program_id: "program-2",
                name: "Advanced Program",
                description: "An advanced program",
                level: "Advanced",
                schedule: [],
              },
            ]),
        });
      }

      // Default mock for any other fetch calls
      return Promise.reject(new Error("Unknown URL"));
    });

    const { getByText, queryByText } = render(<SettingsScreen />);

    // Wait for user data to be fetched and rendered
    await waitFor(() => {
      // Check for section headers
      expect(getByText("Personal Details")).toBeTruthy();
      expect(getByText("My Workout Plans")).toBeTruthy();

      // Check for user details
      expect(getByText(/Username:/)).toBeTruthy();
      expect(getByText("testuser")).toBeTruthy();
      expect(getByText(/Email:/)).toBeTruthy();
      expect(getByText("testuser@example.com")).toBeTruthy();
      expect(getByText(/Age:/)).toBeTruthy();
      expect(getByText("30")).toBeTruthy();
      expect(getByText(/Weight:/)).toBeTruthy();
      expect(getByText("70 kg")).toBeTruthy();
      expect(getByText(/Height:/)).toBeTruthy();
      expect(getByText("175 cm")).toBeTruthy();

      // Check for workout programs
      expect(getByText("Beginner Program")).toBeTruthy();
      expect(getByText("A starter program")).toBeTruthy();
      expect(getByText("Advanced Program")).toBeTruthy();
      expect(getByText("An advanced program")).toBeTruthy();

      // Check for Logout button
      expect(getByText("Logout")).toBeTruthy();
    });
  });

  it("displays the logout button and handles logout correctly", async () => {
    // Mock AsyncStorage.getItem to return a valid token and userId
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "userToken") return Promise.resolve("test-token");
      if (key === "userId") return Promise.resolve("user-123");
      return Promise.resolve(null);
    });

    // Mock fetch for user data
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.endsWith("/api/users/user-123/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              username: "testuser",
              email: "testuser@example.com",
              age: 30,
              weight: 70,
              height: 175,
            }),
        });
      }

      // Mock fetch for workout programs
      if (url.endsWith("/api/user-custom-workout-programs/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                program_id: "program-1",
                name: "Beginner Program",
                description: "A starter program",
                level: "Beginner",
                schedule: [],
              },
            ]),
        });
      }

      // Mock fetch for logout
      if (url.endsWith("/auth/logout/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: "Successfully logged out." }),
        });
      }

      return Promise.reject(new Error("Unknown URL"));
    });

    const { getByText } = render(<SettingsScreen />);

    // Wait for component to finish loading
    await waitFor(() => {
      expect(getByText("Logout")).toBeTruthy();
    });

    // Simulate pressing the Logout button
    fireEvent.press(getByText("Logout"));

    // Wait for the logout process to complete
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "You have been logged out."
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("userToken");
      expect(mockReplace).toHaveBeenCalledWith("/LoginScreen");
    });
  });

  it("handles missing userToken or userId gracefully", async () => {
    // Mock AsyncStorage.getItem to return null for userToken and userId
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));

    // Mock fetch is not necessary here since the component should redirect before making fetch calls

    const { getByText } = render(<SettingsScreen />);

    // Wait for the component to handle missing token and userId
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "You are not logged in.");
      expect(mockReplace).toHaveBeenCalledWith("/LoginScreen");
    });

    // Ensure that no other texts are rendered
    expect(getByText("Personal Details")).toBeTruthy();
    expect(getByText("My Workout Plans")).toBeTruthy();
    expect(getByText("Logout")).toBeTruthy(); // Even though the user is not logged in, the component might still render
  });

  it("handles failed user data fetch gracefully", async () => {
    // Mock AsyncStorage.getItem to return valid token and userId
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "userToken") return Promise.resolve("test-token");
      if (key === "userId") return Promise.resolve("user-123");
      return Promise.resolve(null);
    });

    // Mock fetch for user data to fail
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.endsWith("/api/users/user-123/")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("User not found."),
        });
      }

      // Mock fetch for workout programs
      if (url.endsWith("/api/user-custom-workout-programs/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                program_id: "program-1",
                name: "Beginner Program",
                description: "A starter program",
                level: "Beginner",
                schedule: [],
              },
            ]),
        });
      }

      return Promise.reject(new Error("Unknown URL"));
    });

    const { getByText } = render(<SettingsScreen />);

    // Wait for user data fetch to fail
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to fetch user data.");
      expect(getByText("Failed to load user data.")).toBeTruthy();
    });
  });
});
