let threadId = null;
const agentId = "3149979d-2319-470a-84ae-063950a0a841";
const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
const apiVersion = "2025-05-01";

function addMessage(text, sender) {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    addMessage(messageText, 'user');
    input.value = '';

    try {
        let currentThreadId = threadId;

        if (!currentThreadId) {
            const threadRes = await fetch(`${PROJECT_ENDPOINT}/threads?api-version=${apiVersion}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!threadRes.ok) throw new Error(`Thread failed: ${threadRes.status}`);
            const threadData = await threadRes.json();
            currentThreadId = threadData.id;
            threadId = currentThreadId;
        }

        await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: "user", content: messageText })
        });

        const runRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assistant_id: agentId })
        });

        if (!runRes.ok) throw new Error(`Run failed: ${runRes.status}`);

        const run = await runRes.json();
        let runStatus = run.status || "queued";

        while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
            await new Promise(r => setTimeout(r, 1000));
            const statusRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs/${run.id}?api-version=${apiVersion}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const statusData = await statusRes.json();
            runStatus = statusData.status || "queued";
        }

        const msgsRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const msgsData = await msgsRes.json();
        const assistantMsg = msgsData.data?.find(m => m.role === "assistant");

        const reply = assistantMsg?.content?.[0]?.text?.value || "No response from DadVRchatbot.";
        addMessage(reply, 'assistant');

    } catch (error) {
        console.error("Full error:", error);
        addMessage("Sorry, connection issue. Check F12 console for details.", 'assistant');
    }
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('userInput');
    if (input) {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
