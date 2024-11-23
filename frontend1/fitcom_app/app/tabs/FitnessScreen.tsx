import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Image } from "react-native";

interface Exercise {
  id: number;
  name: string;
  difficulty: string;
  force: string;
  mechanic: string;
  gif_url: string;
}

const FitnessScreen = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const fetchExercises = async () => {
    try {
      const response = await fetch("https://run.mocky.io/v3/0c3678ac-63c5-488b-b79f-3cde0b1115cc");
      const data: Exercise[] = await response.json();
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const filterExercises = (value: string) => {
    setSearchValue(value);
    if (!value.trim()) {
      setFilteredExercises(exercises);
      return;
    }

    const filtered = exercises.filter(
      (exercise) =>
        exercise.name &&
        exercise.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredExercises(filtered);
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Image
          style={styles.exerciseImage}
          source={{ uri: item.gif_url }}
          resizeMode="cover"
        />
      </View>
      <View style={styles.exerciseDetails}>
        <Text>Difficulty: {item.difficulty}</Text>
        <Text>Force: {item.force}</Text>
        <Text>Mechanic: {item.mechanic}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises"
        value={searchValue}
        onChangeText={filterExercises}
      />
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseCard}
        contentContainerStyle={styles.exerciseList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  exerciseList: {
    paddingBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseInfo: {
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  exerciseImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  exerciseDetails: {
    marginTop: 10,
  },
});

export default FitnessScreen;
