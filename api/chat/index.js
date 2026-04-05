module.exports = async function (context, req) {
    context.log('DadVR Proxy - using /protocols/openai');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { reply: "Please type a message." } };
        return;
    }

    try {
 const API_KEY = "8FpcVRioyCoyx0G0Ckc4CpAYjLlfQ99irTAnT33BVDw6o5iyU8gtJQQJ99CDACYeBjFXJ3w3AAAAACOGBRSW";   // ← Replace this line with your real key


        // Use the project endpoint with protocols/openai (recommended for 2026 agents)
        const BASE_URL = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot/protocols/openai";

        const response = await fetch(`${BASE_URL}/responses?api-version=2025-11-15-preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                input: [{ role: "user", content: message }],
                extra_body: {
                    agent_reference: {
                        name: "DadVRchatbot",
                        version: "3",
                        type: "agent_reference"
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "No details");
            throw new Error(`Foundry returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.output_text || 
                     (data.output && data.output[0] && data.output[0].content) || 
                     "DadVRchatbot responded but returned no text.";

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Error:', err.message);
        context.res = {
            status: 200,
            body: { reply: `Error from DadVRchatbot:\n${err.message}` }
        };
    }
};
