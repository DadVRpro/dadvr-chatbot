module.exports = async function (context, req) {
    context.log('DadVR Proxy - fixed reply extraction');

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

        // FIXED: Properly extract the text no matter how the response is structured
        let reply = "DadVRchatbot had no response.";

        if (typeof data.output_text === 'string') {
            reply = data.output_text;
        } else if (data.output && Array.isArray(data.output)) {
            const firstOutput = data.output[0];
            if (firstOutput && typeof firstOutput.content === 'string') {
                reply = firstOutput.content;
            } else if (firstOutput) {
                reply = JSON.stringify(firstOutput, null, 2);
            }
        } else {
            reply = JSON.stringify(data, null, 2);   // fallback so we can see the full response
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
