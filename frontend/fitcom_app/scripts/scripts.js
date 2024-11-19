// Update Date
function updateDate() {
    const dateElement = document.getElementById("currentDate");
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}
updateDate();

// Water Tracker
let waterLevel = 250; 

function adjustWater(amount) {
    waterLevel = Math.max(0, Math.min(3000, waterLevel + amount)); 
    const waterFill = document.getElementById("waterFill");
    const waterAmount = document.getElementById("waterAmount");
    waterFill.style.height = `${(waterLevel / 3000) * 100}%`; 
    waterAmount.textContent = `${waterLevel} ml`; 
}

// Show Program Content
function showProgram(programType) {
    const workoutButton = document.querySelector(".program-button:first-child");
    const mealButton = document.querySelector(".program-button:last-child");

    if (programType === "workout") {
        workoutButton.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
        mealButton.style.boxShadow = "none";
    } else {
        mealButton.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
        workoutButton.style.boxShadow = "none";
    }
}
