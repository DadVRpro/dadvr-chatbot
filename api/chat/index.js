module.exports = async function (context, req) {
    context.log('DadVR Proxy - calling real agent');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    try {
        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
        const agentName = "DadVRchatbot";
        const agentVersion = "3";   // Change if your agent version is different

        const response = await fetch(`${PROJECT_ENDPOINT}/responses?api-version=2025-05-01`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
                // Note: In a real production setup, you would add Authorization header here using DefaultAzureCredential
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
            const errorText = await response.text().catch(() => "No details");
            context.log.error(`Agent API failed: ${response.status} - ${errorText}`);
            throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        const reply = data.output_text || 
                     (data.output && data.output[0] && data.output[0].content) || 
                     "DadVRchatbot returned no text.";

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Full error calling DadVRchatbot:', err);
        context.res = {
            status: 200,
            body: { 
                reply: `DadVRchatbot had trouble responding.\n\nError: ${err.message.substring(0, 100)}...` 
            }
        };
    }
};
