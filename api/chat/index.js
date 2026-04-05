const { DefaultAzureCredential } = require('@azure/identity');
const credential = new DefaultAzureCredential();

module.exports = async function (context, req) {
    context.log('DadVR Proxy - calling real agent with credential');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    try {
        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
        const agentName = "DadVRchatbot";
        const agentVersion = "3";

        // Get token for Azure AI services
        const tokenResponse = await credential.getToken("https://ai.azure.com/.default");
        const token = tokenResponse.token;

        const response = await fetch(`${PROJECT_ENDPOINT}/responses?api-version=2025-05-01`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                input: [{ role: "user", content: message }],
                extra_body: {
                    agent_reference: {
                        name: agentName,
                        version: agentVersion,
                        type: "agent_reference"
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`Agent API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.output_text || 
                     (data.output && data.output[0] && data.output[0].content) || 
                     "DadVRchatbot had no response.";

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Error calling agent:', err);
        context.res = {
            status: 200,
            body: { reply: "Sorry, DadVRchatbot is having trouble responding right now.\n\nPlease try again." }
        };
    }
};
