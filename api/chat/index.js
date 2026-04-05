const { OpenAI } = require('openai');

module.exports = async function (context, req) {
    context.log('DadVR Chat Proxy called');

    const messageText = req.body?.message || '';
    if (!messageText) {
        context.res = { status: 400, body: { error: "Message is required" } };
        return;
    }

    try {
        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
        const apiVersion = "2025-05-01";
        const agentId = "3149979d-2319-470a-84ae-063950a0a841";

        const client = new OpenAI({
            baseURL: PROJECT_ENDPOINT,
            apiKey: "dummy", // Not used – we rely on DefaultAzureCredential in production
            defaultQuery: { "api-version": apiVersion }
        });

        // For now we use a simple echo so you can confirm the proxy works
        // We'll upgrade it to call the real agent in the next step
        context.res = {
            status: 200,
            body: {
                reply: "Proxy is working! DadVRchatbot says: Hello from the backend! (Agent call coming next...)",
                threadId: "proxy-test-123"
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
