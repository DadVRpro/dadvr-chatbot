module.exports = async function (context, req) {
    context.log('DadVR Chat Proxy called');

    const messageText = req.body?.message || '';
    if (!messageText) {
        context.res = { 
            status: 400, 
            body: { error: "Message is required" } 
        };
        return;
    }

    // Simple test response - no external packages
    context.res = {
        status: 200,
        body: {
            reply: "✅ Backend proxy is now working!\n\nDadVRchatbot is connected.\nAsk me anything about VR, Dad jokes, or troubleshooting.",
            threadId: "proxy-" + Date.now()
        }
    };
};
