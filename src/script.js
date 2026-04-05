// Pure frontend calling the proxy at /api/chat
function addMessage(text, sender) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        addMessage(data.reply || "No reply from proxy", 'assistant');

    } catch (err) {
        console.error("Proxy error:", err);
        addMessage("Sorry, the proxy failed. Check F12 console.", 'assistant');
    }
}

// Enter key support
document.getElementById('userInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
