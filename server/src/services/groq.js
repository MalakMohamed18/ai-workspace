import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateAnswer(prompt) {
  const completion = await groq.chat.completions.create({
    model:
      process.env.GROQ_MODEL ||
      "llama-3.3-70b-versatile",

    messages: [
      {
        role: "user",
        content: prompt
      }
    ],

    temperature: 0.1
  });

  return completion.choices?.[0]?.message?.content || "";
}