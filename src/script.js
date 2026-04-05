let threadId = null;   // Keep this at the top of script.js (outside any function)

const agentId = "3149979d-2319-470a-84ae-063950a0a841";
const PROJECT_ENDPOINT =  "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";

async function sendMessage() {
    const input = document.getElementById('userInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    // Add user message immediately for good UX
    addMessage(messageText, 'user');
    input.value = '';

    // === UPDATE THIS WITH YOUR EXACT PROJECT ENDPOINT FROM AZURE AI FOUNDRY ===
    // Go to ai.azure.com → your project → Overview → copy the "Project endpoint"
    // It should look like: https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-foundry  (or /_project)
    const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/_project";  
    const apiVersion = "2025-05-01";   // Try "2025-11-15-preview" if this doesn't work

    try {
        let currentThreadId = threadId;

        // Step 1: Create a new thread if we don't have one
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

        // Step 2: Add the user message to the thread
        await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: "user",
                content: messageText
            })
        });

        // Step 3: Run the DadVRchatbot agent
        const runRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs?api-version=${apiVersion}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assistant_id: agentId
            })
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            throw new Error(`Run start failed: ${runRes.status} - ${errorText}`);
        }

        const run = await runRes.json();
        let runStatus = run.status;

        // Step 4: Simple polling until the run completes
        while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
            await new Promise(resolve => setTimeout(resolve, 800)); // wait 800ms

            const statusRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/runs/${run.id}?api-version=${apiVersion}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const statusData = await statusRes.json();
            runStatus = statusData.status;
        }

        if (runStatus === "failed") {
            throw new Error("Agent run failed");
        }

        // Step 5: Get the latest messages and extract the assistant's reply
        const msgsRes = await fetch(`${PROJECT_ENDPOINT}/threads/${currentThreadId}/messages?api-version=${apiVersion}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const msgsData = await msgsRes.json();
        const assistantMsg = msgsData.data?.find(m => m.role === "assistant");

        const reply = assistantMsg?.content?.[0]?.text?.value 
                      || "DadVRchatbot didn't return a response. Try again.";

        addMessage(reply, 'assistant');

    } catch (error) {
        console.error("Full chat error:", error);
        addMessage("Sorry, I'm having trouble connecting right now. Check the browser console (F12) for details.", 'assistant');
    }
}
