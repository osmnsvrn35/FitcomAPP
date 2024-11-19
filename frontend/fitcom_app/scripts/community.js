console.log("Community.js loaded successfully!");

// Fetch data from the API and render posts
function fetchPosts() {
    renderLoader();

    fetch('https://run.mocky.io/v3/cbe55b83-23f0-4f9e-b458-108bee6636a8')
        .then((response) => response.json())
        .then((data) => {
            window.allPosts = data; 
            renderPosts(data); 
        })
        .catch((error) => {
            console.error('Error fetching posts:', error);
            renderError('Failed to load posts. Please try again later.');
        });
}

// Render posts dynamically
function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; 

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts found.</p>';
        return;
    }

    posts.forEach((post) => {
        const postHTML = `
            <div class="post-card">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p><strong>Type:</strong> ${post.type}</p>
                <p>
                    <strong>Upvotes:</strong> ${post.upvotes} | 
                    <strong>Downvotes:</strong> ${post.downvotes} | 
                    <strong>Comments:</strong> ${post.comments}
                </p>
            </div>
        `;
        postsContainer.innerHTML += postHTML;
    });
}

// Show loader while fetching data
function renderLoader() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '<p>Loading posts...</p>';
}

// Show error message if fetch fails
function renderError(message) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = `<p>${message}</p>`;
}

// Open modal for creating a post
function openModal() {
    document.getElementById('makePostModal').style.display = 'block';
}

// Close the modal
function closeModal() {
    document.getElementById('makePostModal').style.display = 'none';
}

// Toggle filter dropdown
document.getElementById('filter-posts').addEventListener('click', () => {
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.style.display = filterDropdown.style.display === 'none' ? 'block' : 'none';
});

// Update form fields dynamically based on the selected post type
function updatePostForm() {
    const postType = document.getElementById('postType').value;
    document.querySelectorAll('.dynamic-fields').forEach((fieldSet) => {
        fieldSet.style.display = 'none';
    });

    if (postType === 'recipe') {
        document.getElementById('recipeFields').style.display = 'block';
    } else if (postType === 'workout') {
        document.getElementById('workoutFields').style.display = 'block';
    } else if (postType === 'question') {
        document.getElementById('questionFields').style.display = 'block';
    }
}

// Handle post creation
document.getElementById('postForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const postType = document.getElementById('postType').value;
    const postData = {
        type: postType,
        title: document.querySelector(`#${postType}Title`).value,
        content: document.querySelector(`#${postType}Content`)?.value || '',
    };

    if (postType === 'recipe') {
        const imageInput = document.getElementById('recipeImage');
        const imageFile = imageInput.files[0];
        postData.image = imageFile ? imageFile.name : null;
    }

    window.allPosts.push(postData);
    renderPosts(window.allPosts);

    alert('Post created successfully!');
    closeModal();
});

// Apply filters to the posts
document.getElementById('applyFilter').addEventListener('click', () => {
    const filterType = document.getElementById('filterType').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let filteredData = [...window.allPosts];

    if (filterType !== 'all') {
        filteredData = filteredData.filter((post) => post.type.toLowerCase() === filterType.toLowerCase());
    }

    if (sortOrder === 'newest') {
        filteredData.sort((a, b) => b.id - a.id); 
    } else if (sortOrder === 'popular') {
        filteredData.sort((a, b) => b.upvotes - a.upvotes);
    }

    renderPosts(filteredData);
    alert(`Filter applied: ${filterType}, sorted by ${sortOrder}`);
});

const modal = document.getElementById('makePostModal');
document.getElementById('make-post').addEventListener('click', openModal);
document.querySelector('.close').addEventListener('click', closeModal);

fetchPosts();
