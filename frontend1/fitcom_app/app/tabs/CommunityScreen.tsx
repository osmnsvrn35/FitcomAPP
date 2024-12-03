import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";

type Post = {
  post_id: string;
  author: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  image?: string;
  type?: string;
};

type Comment = {
  id: number;
  postId: string;
  content: string;
};

const CommunityScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostType, setNewPostType] = useState<"question" | "recipe">("question");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "recipe" | "question">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "popular">("newest");


  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch posts from the backend
  const fetchPosts = async (): Promise<void> => {
    try {
      const response = await fetch("https://fitcom-9fc3ecf39e06.herokuapp.com/api/posts/");
      const data: Post[] = await response.json();
      const enrichedData = data.map((post) => ({
        ...post,
        type: post.type || "question", 
      }));
      setPosts(enrichedData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts. Please try again later.");
    }
  };

  // Like a post
  const likePost = async (postId: string): Promise<void> => {
    try {
      console.log(`Liking post with ID: ${postId}`);
      const url = `https://fitcom-9fc3ecf39e06.herokuapp.com/api/posts/${postId}/`;

      const getResponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Token 3d4df725723be3284834ebe1e280e7658c79648c",
        },
      });

      if (!getResponse.ok) {
        console.error(`Error fetching post data (status ${getResponse.status}):`, await getResponse.text());
        Alert.alert("Error", `Failed to fetch post data. Status: ${getResponse.status}`);
        return;
      }

      const postData = await getResponse.json();
      const newLikes = postData.likes + 1;

      // Now, send a PATCH request to update the likes count
      const patchResponse = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: "Token 3d4df725723be3284834ebe1e280e7658c79648c",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ likes: newLikes }),
      });

      if (patchResponse.ok) {
        console.log("Successfully liked the post.");
        const updatedPost = await patchResponse.json();

        // Update the local state with the updated post data
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.post_id === postId ? updatedPost : post))
        );
      } else {
        const errorText = await patchResponse.text();
        console.error(`Error updating likes (status ${patchResponse.status}):`, errorText);
        Alert.alert("Error", `Failed to like the post. Status: ${patchResponse.status}`);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      Alert.alert("Error", "An unexpected error occurred while liking the post.");
    }
  };

  // Add a new post
  const addPost = async (): Promise<void> => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Title and content cannot be empty.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newPostTitle);
      formData.append("content", newPostContent);
      formData.append("type", newPostType);
      if (newPostImage) {
        formData.append("image", {
          uri: newPostImage,
          name: "recipe.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await fetch("https://fitcom-9fc3ecf39e06.herokuapp.com/api/posts/", {
        method: "POST",
        headers: {
          Authorization: "Token 3d4df725723be3284834ebe1e280e7658c79648c",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Success", "Post added successfully.");
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostImage(null);
        fetchPosts();
        setModalVisible(false);
      } else {
        const errorData = await response.json();
        console.error("Error adding post:", errorData);
        Alert.alert("Error", "Failed to add post. Please try again later.");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Error", "Failed to add post. Please try again later.");
    }
  };

  // Filtered posts based on search term and filter type
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearchTerm =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilterType = filterType === "all" || post.type === filterType;
      return matchesSearchTerm && matchesFilterType;
    });
  
    // Sort posts based on sortOrder
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Newest first
      } else if (sortOrder === "popular") {
        return b.likes - a.likes; // Most popular first
      }
      return 0;
    });
  
    return sorted;
  }, [posts, searchTerm, filterType, sortOrder]);
  
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => likePost(item.post_id)} style={styles.likeButton}>
          <FontAwesome name="heart" size={20} color="red" />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{item.likes}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for posts..."
          placeholderTextColor="#000" 
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={[styles.sortButton, sortOrder === "newest" && styles.activeSortButton]}
          onPress={() => setSortOrder("newest")}
        >
          <Text style={styles.sortButtonText}>Newest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, sortOrder === "popular" && styles.activeSortButton]}
          onPress={() => setSortOrder("popular")}
        >
          <Text style={styles.sortButtonText}>Popular</Text>
        </TouchableOpacity>
      </View>

      {/* Add Post Button */}
      <TouchableOpacity style={styles.addPostButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Post</Text>
      </TouchableOpacity>
      
      {/* Posts Section */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.post_id}
        contentContainerStyle={styles.postsContainer}
      />

      {/* Create Post Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Content"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
            />
            {/* Optionally include image picker here */}
            <TouchableOpacity style={styles.modalButton} onPress={addPost}>
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
  },
  addPostButton: {
    backgroundColor: "#28A745",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postsContainer: {
    flexGrow: 1,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    marginRight: 10,
  },
  likeCount: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  activeSortButton: {
    backgroundColor: "#007BFF", // Highlight the active button
  },
  sortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
});

export default CommunityScreen;
