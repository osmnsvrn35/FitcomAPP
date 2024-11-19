// Render a loading message or spinner
function renderLoader() {
    const exerciseCardsContainer = document.querySelector('.exercise-cards');
    exerciseCardsContainer.innerHTML = '<p>Loading exercises...</p>';
}

// Render an error message
function renderError(message) {
    const exerciseCardsContainer = document.querySelector('.exercise-cards');
    exerciseCardsContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Render exercises dynamically
function renderExercises(exercises) {
    const exerciseCardsContainer = document.querySelector('.exercise-cards');
    exerciseCardsContainer.innerHTML = ''; 

    if (exercises.length === 0) {
        exerciseCardsContainer.innerHTML = '<p>No exercises found. Try a different search.</p>';
        return;
    }

    exercises.forEach(exercise => {
        const cardHTML = `
            <div class="exercise-card">
                <div class="exercise-info">
                    <h2>${exercise.name}</h2>
                    <img src="${exercise.gif_url}" alt="${exercise.name}" class="exercise-gif">
                </div>
                <div class="exercise-details">
                    <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
                    <p><strong>Force:</strong> ${exercise.force}</p>
                    <p><strong>Mechanic:</strong> ${exercise.mechanic}</p>
                </div>
            </div>
        `;
        exerciseCardsContainer.innerHTML += cardHTML;
    });
}

// Fetch data from the API and render exercises
function fetchExercises() {
    
    renderLoader();

    fetch('https://run.mocky.io/v3/0c3678ac-63c5-488b-b79f-3cde0b1115cc')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderExercises(data); 
        })
        .catch(error => {
            console.error('Error fetching exercises:', error);
            renderError('Failed to load exercises. Please try again later.');
        });
}

// Filter exercises based on search input
function filterExercises(searchValue) {
    fetch('https://run.mocky.io/v3/0c3678ac-63c5-488b-b79f-3cde0b1115cc') 
        .then(response => response.json())
        .then(data => {
            const filteredExercises = data.filter(exercise =>
                exercise.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            renderExercises(filteredExercises);
        })
        .catch(error => {
            console.error('Error filtering exercises:', error);
            renderError('Failed to load exercises. Please try again later.');
        });
}

// Event Listener for Search
document.querySelector('#exercise-search').addEventListener('input', event => {
    const searchValue = event.target.value.trim(); 
    if (searchValue === '') {
        fetchExercises(); 
    } else {
        filterExercises(searchValue); 
    }
});


fetchExercises();
