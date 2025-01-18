import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { requestType, ...params } = req.body;
    
    if (requestType === 'logo') {
      const { symbol, primaryColor, secondaryColor, additionalFeedback = '' } = params;
      
      let prompt = `Create a professional plumbing logo incorporating a ${symbol} using ${primaryColor} as the primary color`;
      if (secondaryColor) {
        prompt += ` and ${secondaryColor} as an accent`;
      }
      prompt += `. Make it simple, modern, and suitable for a plumbing business website.`;
      if (additionalFeedback) {
        prompt += ` Additional requirements: ${additionalFeedback}`;
      }
      
      const response = await openai.images.generate({
        prompt,
        n: 1,
        size: "1024x1024",
        model: "dall-e-3"
      });
      
      return res.status(200).json({ imageUrl: response.data[0].url });
    }
    
    if (requestType === 'heroText') {
      const { businessName, feedback = '' } = params;
      
      let promptContent = `Create three short, engaging hero text options for a plumbing business named "${businessName}". Each should be compelling and include a clear call-to-action.`;
      if (feedback) {
        promptContent += ` Additional requirements: ${feedback}`;
      }
      
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional copywriter specializing in plumbing business websites. Create engaging, action-oriented text that builds trust and encourages contact."
          },
          {
            role: "user",
            content: promptContent
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 200
      });
      
      return res.status(200).json({ text: completion.choices[0].message.content });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
}
