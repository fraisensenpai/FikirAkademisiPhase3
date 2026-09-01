import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase for server-side (using service role key)
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Gemini AI
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gemini AI proxy endpoint
app.post('/api/ai', async (req, res) => {
  const { messages, bookTitle, pageText } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages dizisi gerekli.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY tanımlı değil.' });
  }

  try {
    const systemInstruction = `Sen "Fikir Akademisi" okuma platformunun yapay zeka asistanısın.
Öğrencilere kitapları anlamalarında yardımcı oluyorsun.
Türkçe yanıt ver, samimi ve öğretici ol.
Kitap bağlamı: "${bookTitle || 'Bilinmeyen Kitap'}"
Mevcut sayfa metni:
${pageText || '(Metin mevcut değil)'}`;

    const contents = messages.map((msg: { role: string; text: string }) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const text = response.text || 'Yanıt alınamadı.';
    res.json({ text });
  } catch (err: any) {
    console.error('Gemini API hatası:', err);
    res.status(500).json({ error: err.message || 'AI yanıtı alınamadı.' });
  }
});


app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
