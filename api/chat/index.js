module.exports = async function (context, req) {
    context.log('DadVR Proxy - robust JSON parser');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { reply: "Please type a message." } };
        return;
    }

    try {
        const API_KEY = "8FpcVRioyCoyx0G0Ckc4CpAYjLlfQ99irTAnT33BVDw6o5iyU8gtJQQJ99CDACYeBjFXJ3w3AAAAACOGBRSW";

        const PROJECT_ENDPOINT = "https://dadvr-foundry.services.ai.azure.com/api/projects/dadvr-chatbot";

        const response = await fetch(`${PROJECT_ENDPOINT}/openai/responses?api-version=2025-11-15-preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                model: "gpt-oss-120b",
                input: [{ role: "user", content: message }],
                agent_reference: {
                    name: "DadVRchatbot",
                    version: "3",
                    type: "agent_reference"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "No details");
            throw new Error(`Foundry returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Robust parsing for the structure you showed
        let reply = "DadVRchatbot had no response.";

        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            const item = data.content[0];
            if (item && item.text) {
                reply = item.text;
            } else if (item) {
                reply = JSON.stringify(item);
            }
        } else if (data.output_text) {
            reply = data.output_text;
        } else if (data.output && Array.isArray(data.output) && data.output[0]) {
            reply = data.output[0].content || JSON.stringify(data.output[0]);
        } else {
            // Ultimate fallback: pretty-print the whole thing
            reply = JSON.stringify(data, null, 2);
        }

        context.res = { status: 200, body: { reply: reply } };

    } catch (err) {
        context.log.error('Error:', err.message);
        context.res = {
            status: 200,
            body: { reply: `Error from DadVRchatbot:\n${err.message}` }
        };
    }
};
