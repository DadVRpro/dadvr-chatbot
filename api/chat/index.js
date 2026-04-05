module.exports = async function (context, req) {
    context.log('DadVR Proxy - calling real agent');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    try {
        // Call your DadVRchatbot agent using the Responses API
        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
        const agentName = "DadVRchatbot";
        const agentVersion = "3";   // Change this if your agent has a different version

        const response = await fetch(`${PROJECT_ENDPOINT}/responses?api-version=2025-05-01`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // The proxy runs server-side, so it can use managed identity or key here if needed
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
            throw new Error(`Agent call failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const reply = data.output_text || data.output?.[0]?.content || "DadVRchatbot had no response.";

        context.res = {
            status: 200,
            body: { reply: reply }
        };

    } catch (err) {
        context.log.error('Agent call error:', err);
        context.res = {
            status: 200,   // Return 200 so frontend doesn't break, but show error message
            body: { reply: "Sorry, DadVRchatbot is having trouble responding right now." }
        };
    }
};
