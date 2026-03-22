import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: (import.meta as any).env.VITE_GAPGPT_API_KEY || '',
  baseURL: 'https://api.gapgpt.app/v1',
  dangerouslyAllowBrowser: true
});

export const getTutorResponse = async (
  message: string,
  subject: string,
  level: string,
  history: { role: "user" | "assistant"; text: string }[] = [],
  image?: { data: string; mimeType: string }
) => {
  const model = 'gapgpt-qwen-3.5';
  
  const systemInstruction = `شما "MathKonkur AI" هستید، یک معلم خصوصی هوشمند و فوق‌تخصص ریاضیات برای دانش‌آموزان کنکوری ایران.
هدف شما کمک به دانش‌آموزان برای تسلط کامل بر مباحث ریاضیات کنکور (ریاضی، حسابان، هندسه، گسسته و آمار و احتمال) است.

مباحث تخصصی که شما در آن‌ها تسلط کامل دارید و باید بر اساس آن‌ها راهنمایی کنید:
1. جبر و توابع، 2. معادله و نامعادله، 3. توابع و نمودارها، 4. مثلثات، 5. هندسه تحلیلی، 6. بردارها و هندسه، 7. حسابان، 8. ریاضیات گسسته و آمار و احتمال.

دستورالعمل‌های حیاتی:
1. همیشه به زبان فارسی پاسخ دهید.
2. از روش سقراطی استفاده کنید: مستقیماً پاسخ ندهید، بلکه با پرسیدن سوالات گام‌به‌گام، دانش‌آموز را به کشف راه حل هدایت کنید.
3. برای نوشتن فرمول‌های ریاضی حتماً از فرمت LaTeX استفاده کنید.
4. در حل تست‌ها، حتماً "نکته کنکوری" و "دام‌های آموزشی" را گوشزد کنید.
5. اگر تصویری از یک سوال هندسه یا نمودار ارسال شد، آن را با دقت تحلیل کرده و بر اساس داده‌های بصری راهنمایی کنید.
6. لحن شما باید مشوق، دقیق و علمی باشد.`;

  // Convert history to OpenAI format and ensure it starts with 'user'
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemInstruction
    }
  ];

  // Add history messages
  messages = messages.concat(
    history
      .filter((h, i) => !(i === 0 && h.role === 'assistant')) // Remove leading assistant message
      .map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.text
      }))
  );

  const userContent = `مبحث: ${subject}\nسطح: ${level}\n\n${message}`;
  
  messages.push({
    role: "user",
    content: userContent
  });

  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 2048,
    temperature: 0.7
  });

  return response.choices[0].message.content || '';
};
