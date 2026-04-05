const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
const AGENT_NAME = "DadVRchatbot";
const AGENT_VERSION = "3";   // Change this if your agent version is different

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
        const res = await fetch(`${PROJECT_ENDPOINT}/responses?api-version=2025-05-01`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: [{ role: "user", content: message }],
                extra_body: {
                    agent_reference: {
                        name: AGENT_NAME,
                        version: AGENT_VERSION,
                        type: "agent_reference"
                    }
                }
            })
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();
        const reply = data.output_text || data.output?.[0]?.content || "DadVRchatbot didn't respond.";
        addMessage(reply, 'assistant');

    } catch (err) {
        console.error("Chat error:", err);
        addMessage("Sorry, failed to connect (check F12 console).", 'assistant');
    }
}

// Press Enter to send
document.getElementById('userInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
