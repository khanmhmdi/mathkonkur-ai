import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const getTutorResponse = async (
  message: string,
  subject: string,
  level: string,
  history: { role: "user" | "model"; text: string }[] = [],
  image?: { data: string; mimeType: string }
) => {
  const model = "gemini-3-flash-preview";
  
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

  // Ensure history starts with 'user' and alternates correctly
  let contents = history
    .filter((h, i) => !(i === 0 && h.role === 'model')) // Remove leading model message
    .map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

  const userParts: any[] = [{ text: `مبحث: ${subject}\nسطح: ${level}\n\n${message}` }];
  if (image) {
    userParts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  contents.push({
    role: "user",
    parts: userParts
  });

  const response = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text;
};
