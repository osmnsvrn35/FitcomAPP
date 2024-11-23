import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";

type Post = {
  id: number;
  title: string;
  content: string;
  type: string;
  upvotes: number;
  downvotes: number;
};

const CommunityScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "recipe" | "workout" | "question">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "popular">("newest");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (): Promise<void> => {
    try {
      const response = await fetch("https://run.mocky.io/v3/cbe55b83-23f0-4f9e-b458-108bee6636a8");
      const data: Post[] = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts. Please try again later.");
    }
  };

  const applyFilters = (): void => {
    let updatedPosts = [...posts];

    if (filterType !== "all") {
      updatedPosts = updatedPosts.filter(
        (post) => post.type.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (sortOrder === "newest") {
      updatedPosts.sort((a, b) => b.id - a.id);
    } else if (sortOrder === "popular") {
      updatedPosts.sort((a, b) => b.upvotes - a.upvotes);
    }

    setFilteredPosts(updatedPosts);
    setFilterVisible(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postMeta}>
        <Text>Type: {item.type} | </Text>
        <Text>Upvotes: {item.upvotes} | </Text>
        <Text>Downvotes: {item.downvotes}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search for posts..." />
        <Button title="Filter" onPress={() => setFilterVisible(true)} />
      </View>

      {/* Posts Section */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.postsContainer}
      />

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Filter by Type</Text>
            <Button title="All" onPress={() => setFilterType("all")} />
            <Button title="Recipe" onPress={() => setFilterType("recipe")} />
            <Button title="Workout" onPress={() => setFilterType("workout")} />
            <Button title="Question" onPress={() => setFilterType("question")} />
            <Text>Sort by</Text>
            <Button title="Newest" onPress={() => setSortOrder("newest")} />
            <Button title="Most Popular" onPress={() => setSortOrder("popular")} />
            <Button title="Apply Filters" onPress={applyFilters} />
            <Button title="Close" onPress={() => setFilterVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f9",
    padding: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  postsContainer: {
    flexGrow: 1,
  },
  postCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  postMeta: {
    fontSize: 12,
    color: "#777",
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
    borderRadius: 8,
  },
});

export default CommunityScreen;
