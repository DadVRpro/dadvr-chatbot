// === YOUR FOUNDRY DETAILS ===
const foundryBase = "https://dadvr-foundry.api.azure.com";   // Update if needed
const agentId = "3149979d-2319-470a-84ae-063950a0a841";

let threadId = null;

async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    
    if (!messageText) return;

    // Add user message to UI
    addMessage(messageText, 'user');
    input.value = '';

    try {
        const response = await fetch(`${foundryBase}/openai/threads/runs`, {   // This is a common pattern — we may need to adjust
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization will be handled later — for now this may fail (expected)
            },
            body: JSON.stringify({
                assistant_id: agentId,
                thread: threadId ? { id: threadId } : null,
                messages: [{ role: "user", content: messageText }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Save threadId for conversation continuity
        if (data.thread_id) threadId = data.thread_id;

        // Display the assistant reply
        const reply = data.reply || data.content || "Sorry, I didn't get a response.";
        addMessage(reply, 'assistant');

    } catch (error) {
        console.error(error);
        addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'assistant');
    }
}

function addMessage(text, sender) {
    const chatWindow = document.getElementById('chatWindow');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Allow pressing Enter to send
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});
