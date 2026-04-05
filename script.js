const foundryEndpoint = "https://dadvr-foundry.api.azure.com"; // your endpoint
const agentId = "3149979d-2319-470a-84ae-063950a0a841";

let threadId = null;   // We'll store conversation ID here

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  input.value = '';

  try {
    const response = await fetch('/api/chat', {   // We'll create this route later if needed
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, threadId })
    });

    const data = await response.json();
    threadId = data.threadId;   // Save for next messages
    addMessage(data.reply, 'assistant');
  } catch (err) {
    addMessage("Sorry, something went wrong.", 'assistant');
  }
}

function addMessage(text, sender) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
