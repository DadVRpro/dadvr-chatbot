module.exports = async function (context, req) {
    context.log('DadVR Proxy - using API key');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    try {
        // === PASTE YOUR API KEY HERE ===
        const API_KEY = "8FpcVRioyCoyx0G0Ckc4CpAYjLlfQ99irTAnT33BVDw6o5iyU8gtJQQJ99CDACYeBjFXJ3w3AAAAACOGBRSW";   // ← Replace this line with your real key

        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";
        const agentName = "DadVRchatbot";
        const agentVersion = "3";

        const response = await fetch(`${PROJECT_ENDPOINT}/responses?api-version=2025-05-01`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
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
            throw new Error(`Agent failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const reply = data.output_text || 
                     (data.output && data.output[0] && data.output[0].content) || 
                     "DadVRchatbot had no response.";

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Agent call error:', err);
        context.res = {
            status: 200,
            body: { reply: "Sorry, DadVRchatbot is having trouble responding right now.\n\nPlease try again in a moment." }
        };
    }
};
