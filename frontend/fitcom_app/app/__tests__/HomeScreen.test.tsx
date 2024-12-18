// app/__tests__/HomeScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../tabs/HomeScreen'; // Adjust the import path as needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock Alert.alert to prevent actual alerts during tests
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('renders Loading nutrition data text', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Loading nutrition data...')).toBeTruthy();
  });

  it('renders + Add Meal button', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('+ Add Meal')).toBeTruthy();
  });

  it('renders + Add Food button', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('+ Add Food')).toBeTruthy();
  });

  it('renders water level', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('1000 ml')).toBeTruthy();
  });

  it('renders Workout Program section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Workout Program')).toBeTruthy();
  });

  it('renders Meal Program section', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Meal Program')).toBeTruthy();
  });

  // ==== Additional Passing Tests ====

  it('renders the Close button in Add Meal modal', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    // Open Add Meal modal by pressing the button with text '+ Add Meal'
    fireEvent.press(getByText('+ Add Meal'));

    // Verify that the Close button is rendered
    await waitFor(() => {
      expect(getByText('Close')).toBeTruthy();
    });

    // Close the modal
    fireEvent.press(getByText('Close'));

    // Verify that the Close button is no longer visible
    await waitFor(() => {
      expect(queryByText('Close')).toBeNull();
    });
  });

  it('renders the Close button in Add Food modal', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    // Open Add Food modal by pressing the button with text '+ Add Food'
    fireEvent.press(getByText('+ Add Food'));

    // Verify that the Close button is rendered
    await waitFor(() => {
      expect(getByText('Close')).toBeTruthy();
    });

    // Close the modal
    fireEvent.press(getByText('Close'));

    // Verify that the Close button is no longer visible
    await waitFor(() => {
      expect(queryByText('Close')).toBeNull();
    });
  });

  it('renders minus button for water level', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('-')).toBeTruthy();
  });

  it('renders plus button for water level', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('+')).toBeTruthy();
  });

});