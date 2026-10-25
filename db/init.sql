CREATE TABLE IF NOT EXISTS translation_history (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO translation_history (source_text, translated_text, source_lang, target_lang)
VALUES ('Hello', 'Привет', 'en', 'ru');