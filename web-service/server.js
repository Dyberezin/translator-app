const express = require('express');

const app = express();
app.use(express.json());

// Простой словарь для демонстрации (работает без интернета)
const DICTIONARY = {
    'en-ru': {
        hello: 'привет',
        world: 'мир',
        wood: 'древесина',
        cat: 'кот',
        dog: 'собака',
        book: 'книга',
        water: 'вода',
        sun: 'солнце',
        moon: 'луна',
        house: 'дом'
    },
    'ru-en': {
        привет: 'hello',
        мир: 'world',
        древесина: 'wood',
        кот: 'cat',
        собака: 'dog',
        книга: 'book',
        вода: 'water',
        солнце: 'sun',
        луна: 'moon',
        дом: 'house'
    },
    'en-zh': {
        hello: '你好',
        world: '世界',
        cat: '猫',
        dog: '狗',
        book: '书',
        water: '水'
    },
    'zh-en': {
        你好: 'hello',
        世界: 'world',
        猫: 'cat',
        狗: 'dog',
        书: 'book',
        水: 'water'
    }
};

// Перевод через локальный словарь
function translateLocal(text, source, target) {
    const key = `${source}-${target}`;
    const dict = DICTIONARY[key];
    if (!dict) return null;
    const word = text.toLowerCase().trim();
    return dict[word] || null;
}

// Перевод через MyMemory API (если словарь не помог)
async function translateRemote(text, source, target) {
    const langpair = `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
    }
    throw new Error('MyMemory не вернул перевод');
}

app.post('/translate', async (req, res) => {
    const { q, source, target } = req.body;
    if (!q || !source || !target) {
        return res.status(400).json({ error: 'Нужны поля q, source, target' });
    }

    try {
        // Сначала пробуем локальный словарь
        let translated = translateLocal(q, source, target);

        // Если не нашли — идём в MyMemory
        if (!translated) {
            translated = await translateRemote(q, source, target);
        }

        res.json({ translatedText: translated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(5000, () => console.log('web-service запущен на порту 5000'));