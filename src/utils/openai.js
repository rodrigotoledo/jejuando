import OpenAI from "openai";
import Config from "react-native-config";

let openai = new OpenAI({ apiKey: Config.API_GPT_KEY });
openai.baseURL = "https://api.openai.com/v1";
openai.buildURL = (path) =>
  `${openai.baseURL}${path.startsWith("/") ? path : "/" + path}`;

export const callGPTAPI = async (prompt, model = "gpt-4o", temperature = 0.7) => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Erro ao chamar GPT:", err);
    throw err;
  }
};
