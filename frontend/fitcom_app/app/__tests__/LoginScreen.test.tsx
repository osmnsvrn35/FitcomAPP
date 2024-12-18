import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock `expo-router`
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock `AsyncStorage`
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

// Mock `fetch`
global.fetch = jest.fn();

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in successfully and navigates to the main app", async () => {
    // Mock successful login response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mockToken", user_id: 123 }),
    });

    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);

    // Simulate user input
    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    // Simulate login button press using testID
    fireEvent.press(getByTestId("loginButton"));

    // Wait for AsyncStorage and navigation to be called
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("userToken", "mockToken");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("userId", "123");
      expect(mockReplace).toHaveBeenCalledWith("/tabs");
    });
  });
});
