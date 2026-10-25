const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к базе данных (адрес db автоматически разрешается через внутреннюю сеть Docker)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Эндпоинт 1: получение истории переводов (соответствует "Кнопке 1" фронтенда)
app.get('/api/history', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM translation_history ORDER BY created_at DESC LIMIT 20'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Эндпоинт 2: выполнение перевода (соответствует "Кнопке 2" фронтенда)
app.post('/api/translate', async (req, res) => {
    const { text, source, target } = req.body;
    try {
        // Вызов контейнера web-service (LibreTranslate)
        const response = await fetch(process.env.TRANSLATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, source, target, format: 'text' }),
        });
        const data = await response.json();
        const translated = data.translatedText;

        // Сохранение в базу данных
        await pool.query(
            'INSERT INTO translation_history (source_text, translated_text, source_lang, target_lang) VALUES ($1, $2, $3, $4)',
            [text, translated, source, target]
        );

        res.json({ translatedText: translated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Backend running on port 3000'));