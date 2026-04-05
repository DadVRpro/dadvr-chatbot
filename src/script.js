// =============================================
// DadVR Chatbot - Simple Frontend
// =============================================

let threadId = null;   // Will be managed by the backend

// Add a message to the chat window
function addMessage(text, sender) {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send message to the backend proxy
async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    // Show user message immediately
    addMessage(messageText, 'user');
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText, threadId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        // Save threadId for conversation continuity
        if (data.threadId) {
            threadId = data.threadId;
        }

        addMessage(data.reply || "No reply received from DadVRchatbot.", 'assistant');

    } catch (error) {
        console.error("Proxy error:", error);
        addMessage("Sorry, the chatbot is having trouble connecting right now. Check the browser console for details.", 'assistant');
    }
}

// Allow pressing Enter to send
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('userInput');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
