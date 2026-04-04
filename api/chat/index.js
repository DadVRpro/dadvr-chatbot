import fetch from "node-fetch";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();

export default async function (context, req) {
  const userMessage = req.body?.message;

  if (!userMessage) {
    context.res = { status: 400, body: "Missing message" };
    return;
  }

  const token = await credential.getToken(
    "https://cognitiveservices.azure.com/.default"
  );

  const foundryEndpoint = "https://dadvr-foundry.api.azure.com";
  const agentId = "3149979d-2319-470a-84ae-063950a0a841";

  const response = await fetch(
    `${foundryEndpoint}/agents/${agentId}/invoke?api-version=2024-10-01-preview`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }]
      }),
    }
  );

  const data = await response.json();

  context.res = {
    status: 200,
    body: data,
  };
}
