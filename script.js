async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    addMessage(messageText, 'user');
    input.value = '';

    // === UPDATE THESE TWO LINES WITH YOUR REAL VALUES ===
    const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/YOUR_PROJECT_NAME_HERE";  // ← CHANGE THIS
    const apiVersion = "2025-05-01";  // or "2025-11-15-preview" — try both if needed

    try {
        // Step 1: Create or use existing thread
        let currentThreadId = threadId;
        if (!currentThreadId) {
            const threadRes = await fetch(`${PROJECT_ENDPOINT}/threads?api-version=${apiVersion}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const threadData = await threadRes.json();
            currentThreadId = threadData.id;
            threadId = currentThreadId;
        }

        // Step 2: Add user message
        await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: "user",
                content: messageText
            })
        });

        // Step 3: Run the agent
        const runRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assistant_id: agentId   // your DadVRchatbot ID
            })
        });

        if (!runRes.ok) {
            throw new Error(`Run failed: ${runRes.status} ${await runRes.text()}`);
        }

        // For simplicity, we'll poll once (can be improved later)
        const runData = await runRes.json();
        // In a real implementation we'd poll the run status, but this is the minimal version

        // Get messages (simplified)
        const msgsRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const msgsData = await msgsRes.json();

        const assistantMsg = msgsData.data?.find(m => m.role === "assistant");
        const reply = assistantMsg?.content?.[0]?.text?.value || "No response from agent.";

        addMessage(reply, 'assistant');

    } catch (error) {
        console.error("Full error:", error);
        addMessage("Sorry, I'm having trouble connecting. Check the browser console (F12) for details.", 'assistant');
    }
}
