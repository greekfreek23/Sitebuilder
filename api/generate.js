import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { requestType, ...params } = req.body;
    
    if (requestType === 'logo') {
      const { symbol, primaryColor, secondaryColor } = params;
      const prompt = `Create a professional plumbing logo incorporating a ${symbol} using ${primaryColor} as the primary color${secondaryColor ? ` and ${secondaryColor} as an accent` : ''}. Make it simple, modern, and suitable for a plumbing business website.`;
      
      const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      
      return res.status(200).json({ imageUrl: response.data.data[0].url });
    }
    
    else if (requestType === 'heroText') {
      const { businessName } = params;
      const completion = await openai.createChatCompletion({
        model: "gpt-4.0-turbo",
        messages: [{
          role: "system",
          content: "You are a professional copywriter creating compelling website hero text."
        }, {
          role: "user",
          content: `Create a short, engaging hero text for a plumbing business named ${businessName}. Include a clear call-to-action.`
        }]
      });
      
      return res.status(200).json({ text: completion.data.choices[0].message.content });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
