module.exports = async function (context, req) {
    context.log('DadVR Proxy started');

    const message = req.body && req.body.message ? req.body.message.trim() : '';

    if (!message) {
        context.res = { status: 400, body: { error: "Message required" } };
        return;
    }

    // Echo reply to prove the proxy works
    context.res = {
        status: 200,
        body: {
            reply: `✅ The proxy is working!\n\nYou asked: "${message}"\n\nReal DadVRchatbot response will appear here once connected.`
        }
    };
};
