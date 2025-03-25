// Campus Guide Chatbot - JavaScript
// This script adds interactivity to the Campus Guide Chatbot by handling user inputs, displaying messages, and integrating with various features like maps and data fetching.

// Some suggestions to get started:
// 1. Add functionality to show/hide the map
// 2. Implement the "Find My Way" button to get user location
// 3. Add event listeners for the chat input and buttons
// 4. Create functions to handle message display

// Select elements
// We are selecting HTML elements by their IDs to interact with them in JavaScript.
const mapContainer = document.getElementById('map-container'); // The container for the map, initially hidden.
const showMapBtn = document.getElementById('show-map-btn'); // Button to show the map.
const findWayBtn = document.getElementById('find-way-btn'); // Button to find the user's location.
const userInput = document.getElementById('user-input'); // Input field where users type their messages.
const sendButton = document.getElementById('send-button'); // Button to send the user's message.
const chatBox = document.querySelector('.chat-box'); // The chat box where messages are displayed.
const closeMapBtn = document.getElementById('close-map'); // Button to close the map.

// Function to toggle map visibility
// This function shows or hides the map container by toggling the 'hidden' class.
function toggleMap() {
    mapContainer.classList.toggle('hidden'); // Toggles the 'hidden' class, which controls the visibility of the map.
}

// Function to handle "Find My Way"
// This function uses the Geolocation API to get the user's current location.
function findMyWay() {
    if (navigator.geolocation) { // Check if the browser supports geolocation.
        navigator.geolocation.getCurrentPosition((position) => { // Get the current position.
            const { latitude, longitude } = position.coords; // Destructure latitude and longitude from the position object.
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Log the coordinates to the console for debugging.
            // Display the user's location in the chat.
            displayMessage(`Your location is Latitude: ${latitude}, Longitude: ${longitude}`, 'bot');
        });
    } else {
        alert('Geolocation is not supported by this browser.'); // Alert the user if geolocation is not supported.
    }
}

// Function to handle "Directions"
// This function is a placeholder for fetching and displaying directions using a map service.
function getDirections() {
    // Currently, this function logs a message and displays a placeholder message in the chat.
    console.log("Fetching directions...");
    displayMessage("Fetching directions... (This feature requires map service integration)", 'bot');
}

// Function to handle "Faculty Info"
// This function fetches faculty information from a JSON file and displays it in the chat.
function showFacultyInfo() {
    fetch('faculty.json') // Fetch the JSON file containing faculty information.
        .then(response => response.json()) // Parse the response as JSON.
        .then(data => {
            data.forEach(faculty => { // Iterate over each faculty member in the data.
                // Display each faculty member's information in the chat.
                displayMessage(`Name: ${faculty.name}, Department: ${faculty.department}, Email: ${faculty.email}`, 'bot');
            });
        })
        .catch(error => console.error('Error fetching faculty info:', error)); // Log any errors to the console.
}

// Function to handle "Room Availability"
// This function fetches room availability data from a JSON file and displays it in the chat.
function checkRoomAvailability() {
    fetch('rooms.json') // Fetch the JSON file containing room availability.
        .then(response => response.json()) // Parse the response as JSON.
        .then(data => {
            data.forEach(room => { // Iterate over each room in the data.
                // Display each room's availability in the chat.
                displayMessage(`Room: ${room.room}, Availability: ${room.availability}`, 'bot');
            });
        })
        .catch(error => console.error('Error fetching room availability:', error)); // Log any errors to the console.
}

// Function to handle "Events"
// This function fetches event data from a JSON file and displays it in the chat.
function showEvents() {
    fetch('events.json') // Fetch the JSON file containing event information.
        .then(response => response.json()) // Parse the response as JSON.
        .then(data => {
            data.forEach(event => { // Iterate over each event in the data.
                // Display each event's details in the chat.
                displayMessage(`Event: ${event.event}, Date: ${event.date}, Location: ${event.location}`, 'bot');
            });
        })
        .catch(error => console.error('Error fetching events:', error)); // Log any errors to the console.
}

// Function to display messages
// This function creates a new message element and appends it to the chat box.
function displayMessage(message, sender) {
    const messageDiv = document.createElement('div'); // Create a new div element for the message.
    messageDiv.classList.add('message', sender); // Add classes for styling based on the sender (user or bot).
    messageDiv.innerHTML = `<span>${message}</span>`; // Set the message text inside a span element.
    chatBox.appendChild(messageDiv); // Append the message to the chat box.
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box to show the new message.
}

// Event listeners
// These listeners handle user interactions with the buttons and input field.
showMapBtn.addEventListener('click', toggleMap); // Show the map when the "Show Map" button is clicked.
closeMapBtn.addEventListener('click', toggleMap); // Hide the map when the "Close Map" button is clicked.
findWayBtn.addEventListener('click', findMyWay); // Find the user's location when the "Find My Way" button is clicked.
sendButton.addEventListener('click', () => { // Send the user's message when the "Send" button is clicked.
    const message = userInput.value; // Get the message from the input field.
    if (message) { // Check if the message is not empty.
        displayMessage(message, 'user'); // Display the user's message in the chat.
        userInput.value = ''; // Clear the input field.
    }
});

// Optional: Add event listener for Enter key in the input field
// This allows users to send messages by pressing Enter.
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') { // Check if the Enter key was pressed.
        sendButton.click(); // Trigger the click event on the "Send" button.
    }
});

// Event listeners for new buttons
// These listeners handle interactions with additional feature buttons.
document.getElementById('directions-btn').addEventListener('click', getDirections); // Fetch directions when the "Directions" button is clicked.
document.getElementById('faculty-info-btn').addEventListener('click', showFacultyInfo); // Show faculty info when the "Faculty Info" button is clicked.
document.getElementById('room-availability-btn').addEventListener('click', checkRoomAvailability); // Check room availability when the "Room Availability" button is clicked.
document.getElementById('events-btn').addEventListener('click', showEvents); // Show events when the "Events" button is clicked.
