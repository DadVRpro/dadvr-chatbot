module.exports = async function (context, req) {
    context.log('DadVR Proxy - diagnostic version');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { reply: "Please type a message." } };
        return;
    }

    try {
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
            const errorText = await response.text().catch(() => "No error body");
            context.log.error(`Raw error from Foundry: ${response.status} - ${errorText}`);
            throw new Error(`Foundry returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.output_text || (data.output && data.output[0] && data.output[0].content) || "No response text.";

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Full error:', err.message);
        context.res = {
            status: 200,
            body: { 
                reply: `Error connecting to DadVRchatbot:\n${err.message}` 
            }
        };
    }
};
