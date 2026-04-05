const { OpenAI } = require('openai');

module.exports = async function (context, req) {
    const messageText = req.body?.message || '';
    if (!messageText) {
        context.res = { status: 400, body: { error: "No message provided" } };
        return;
    }

    try {
        // === UPDATE THIS WITH YOUR REAL FOUNDRY PROJECT ENDPOINT ===
        const projectEndpoint = "https://dadvr-foundry.services.ai.azure.com/api/projects/_project";  // or your exact project name

        const client = new OpenAI({
            baseURL: projectEndpoint,
            apiKey: process.env.AZURE_AI_FOUNDRY_KEY || "dummy",  // we'll use managed identity later if possible
            defaultQuery: { "api-version": "2025-05-01" }
        });

        // For now we'll use a simple thread + run pattern (can be improved)
        // Note: Full agent invocation often requires the Agents API, not just OpenAI client

        context.res = {
            status: 200,
            body: {
                reply: "Hello from DadVR Chatbot proxy! (Proxy is working but agent call needs tuning)",
                threadId: "temp-123"
            }
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: { error: "Proxy error: " + error.message }
        };
    }
};
