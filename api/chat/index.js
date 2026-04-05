module.exports = async function (context, req) {
    context.log('DadVR Proxy - minimal echo version');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    // Simple echo to confirm the proxy is alive
    context.res = {
        status: 200,
        body: {
            reply: `✅ Proxy is running!\n\nYou said: "${message}"\n\n(DadVRchatbot real response will appear here next.)`,
            threadId: "test-" + Date.now()
        }
    };
};
