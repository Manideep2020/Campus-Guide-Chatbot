// Config
const API_BASE = '/api';
let isProcessing = false;

// DOM Elements
const elements = {
  userInput: document.getElementById('user-input'),
  sendButton: document.getElementById('send-button'),
  chatMessages: document.getElementById('chat-messages'),
  loading: document.getElementById('loading-indicator')
};

// API Helper
const fetchAPI = async (endpoint, options={}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();

  } catch (err) {
    console.error('API Error:', err);
    showNotification(err.message || 'Connection error', 'error');
    throw err;
  }
};

// UI Helpers
const toggleLoading = (show) => {
  isProcessing = show;
  elements.loading.classList.toggle('hidden', !show);
  elements.sendButton.disabled = show;
};

const showNotification = (message, type='info') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.getElementById('system-notifications').appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
};

const displayMessage = (content, isUser) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
  messageDiv.innerHTML = `
    <img src="images/${isUser ? 'user' : 'bot'}-avatar.png" class="avatar">
    <div class="message-content">
      ${typeof content === 'string' ? `<p>${content}</p>` : content}
    </div>
  `;
  elements.chatMessages.appendChild(messageDiv);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

// Message Handling
const handleUserMessage = async () => {
  if (isProcessing) return;
  const message = elements.userInput.value.trim();
  if (!message) return;

  try {
    toggleLoading(true);
    elements.userInput.value = '';
    displayMessage(message, true);

    const { data } = await fetchAPI('/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });

    if (data.type === 'faculty') {
      data.data.forEach(faculty => {
        const content = `
          <div class="structured-data faculty-card">
            <h4>${faculty.name}</h4>
            <p>Department: ${faculty.department}</p>
            <p>Office: ${faculty.office}</p>
            <p class="faculty-email">${faculty.email}</p>
          </div>
        `;
        displayMessage(content, false);
      });
    } else if (data.type === 'rooms') {
      const roomsList = data.data.map(room => 
        `<li>${room.name} (Capacity: ${room.capacity}) - ${room.available ? '🟢' : '🔴'}</li>`
      ).join('');
      displayMessage(`<strong>Available Rooms:</strong><ul>${roomsList}</ul>`, false);
    } else {
      displayMessage(data.data, false);
    }

  } catch (err) {
    displayMessage("Sorry, I'm having trouble processing your request.", false);
  } finally {
    toggleLoading(false);
  }
};

// Event Listeners
elements.sendButton.addEventListener('click', handleUserMessage);
elements.userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !isProcessing) handleUserMessage();
});

// Quick Actions
document.querySelectorAll('.quick-reply').forEach(button => {
  button.addEventListener('click', (e) => {
    if (isProcessing) return;
    elements.userInput.value = `Show ${e.target.dataset.query}`;
    handleUserMessage();
  });
});

// File Upload Handling
document.getElementById('attach-button').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showNotification('File size exceeds 5MB limit', 'error');
    return;
  }

  displayMessage(`📎 Attached file: ${file.name}`, true);
});

// Emergency Information
document.getElementById('emergency-info-btn').addEventListener('click', () => {
  const content = `
    <div class="structured-data emergency-info">
      <h4>🚨 Emergency Contacts</h4>
      <ul>
        <li>Campus Security: +91-XXX-XXX-XXXX</li>
        <li>Medical Emergency: 108</li>
        <li>Fire Department: 101</li>
      </ul>
    </div>
  `;
  displayMessage(content, false);
});

// Initialize Map Toggle
document.getElementById('show-map-btn').addEventListener('click', () => {
  document.getElementById('map-container').classList.toggle('active');
});
