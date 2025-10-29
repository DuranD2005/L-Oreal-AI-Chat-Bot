/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant that specializes ONLY in L'Oréal products, routines, recommendations, ingredients, and other beauty-related topics. If a user asks about anything outside these topics (for example: legal, medical, political, non-beauty product recommendations, or unrelated personal advice), politely refuse to answer and reply with a short message such as: 'I'm here to help with L'Oréal products and beauty-related questions. I can't assist with that topic.' Offer to help with a related L'Oréal or beauty question if possible. Keep refusals brief, polite, and do not provide alternative external advice.",
  },
];
// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Add the worker URL constant so other parts of the script can use the proxy worker if needed
const workerUrl = "https://loreal-ai-bot-worker.durandavis2023.workers.dev/"; // Cloudflare Worker that holds the OPENAI_API_KEY

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Get the user's input and ignore empty submissions
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Push the user's message into the messages array
  messages.push({ role: "user", content: userMessage });

  // Show the user's message in the chat window
  // Create a row container so we can align this message to the right
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  const userPara = document.createElement("div");
  userPara.textContent = `You: ${userMessage}`;
  userPara.className = "msg user";
  userRow.appendChild(userPara);
  chatWindow.appendChild(userRow);
  // Smooth-scroll the newly appended user row into view
  userRow.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Clear the input
  userInput.value = "";

  // Send the full messages array to your Cloudflare Worker proxy.
  // The worker holds the real OPENAI_API_KEY on the server and forwards the request to OpenAI.
  try {
    // Use async/await for beginner-friendly code and clearer error handling
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No Authorization header here — the worker handles the secret key server-side.
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    // The assistant text is returned at data.choices[0].message.content
    const assistantText =
      data?.choices?.[0]?.message?.content || "(no response)";
    messages.push({ role: "assistant", content: assistantText });
    // Create a left-aligned row container for the assistant
    const botRow = document.createElement("div");
    botRow.className = "msg-row ai";
    const botPara = document.createElement("div");
    botPara.textContent = `Assistant: ${assistantText}`;
    botPara.className = "msg ai";
    botRow.appendChild(botPara);
    chatWindow.appendChild(botRow);
    // Smooth-scroll the newly appended assistant row into view
    botRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    console.error(err);
    const errRow = document.createElement("div");
    errRow.className = "msg-row ai";
    const errPara = document.createElement("div");
    errPara.textContent = "Error contacting the API.";
    errPara.className = "msg ai error";
    errRow.appendChild(errPara);
    chatWindow.appendChild(errRow);
    // Smooth-scroll the newly appended error row into view
    errRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
});
