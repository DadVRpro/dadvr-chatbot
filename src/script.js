// =============================================
// DadVR Chatbot - Simple Frontend
// =============================================

let threadId = null;
const agentId = "3149979d-2319-470a-84ae-063950a0a841";

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

// Send message to the agent
async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    // Show user message immediately
    addMessage(messageText, 'user');
    input.value = '';

    // === YOUR FOUNDRY PROJECT ENDPOINT (from your Python code) ===
    const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
    const apiVersion = "2025-05-01";

    try {
        let currentThreadId = threadId;

        // Step 1: Create thread if needed
        if (!currentThreadId) {
            const threadRes = await fetch(`${PROJECT_ENDPOINT}/threads?api-version=${apiVersion}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!threadRes.ok) throw new Error(`Thread creation failed: ${threadRes.status}`);
            const threadData = await threadRes.json();
            currentThreadId = threadData.id;
            threadId = currentThreadId;
        }

        // Step 2: Add user message
        await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: "user", content: messageText })
        });

        // Step 3: Run the DadVRchatbot agent
        const runRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assistant_id: agentId })
        });

        if (!runRes.ok) {
            const errText = await runRes.text().catch(() => "");
            throw new Error(`Failed to start run: ${runRes.status} ${errText}`);
        }

        const run = await runRes.json();
        let runStatus = run.status || "queued";

        // Step 4: Poll until run completes
        while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs/${run.id}?api-version=${apiVersion}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const statusData = await statusRes.json();
            runStatus = statusData.status || "queued";
        }

        if (runStatus === "failed") {
            throw new Error("Agent run failed");
        }

        // Step 5: Get the assistant's reply
        const msgsRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const msgsData = await msgsRes.json();
        const assistantMsg = msgsData.data?.find(m => m.role === "assistant");

        const reply = assistantMsg?.content?.[0]?.text?.value 
                      || "DadVRchatbot didn't return a response this time.";

        addMessage(reply, 'assistant');

    } catch (error) {
        console.error("Full error details:", error);
        addMessage("Sorry, I'm having trouble connecting right now. Check the browser console (F12) for details.", 'assistant');
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
