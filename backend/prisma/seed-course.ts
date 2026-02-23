/**
 * Seed: создаёт тестовый курс с модулями, уроками и записью пользователя на курс.
 * 
 * Запуск: npx ts-node prisma/seed-course.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Берём первого пользователя из БД
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('❌ В БД нет пользователей. Сначала зарегистрируйтесь через сайт.');
        process.exit(1);
    }

    console.log(`👤 Используем пользователя: ${user.name} (${user.email})`);

    // Проверяем, не создан ли уже курс
    const existing = await prisma.course.findFirst({ where: { slug: 'web-development-fundamentals' } });
    if (existing) {
        console.log('⚠️ Курс уже существует, пропускаем создание.');
        console.log(`   ID: ${existing.id}`);
        console.log(`   URL: http://localhost:3000/courses/${existing.slug || existing.id}`);
        process.exit(0);
    }

    // Создаём курс с модулями и уроками
    const course = await prisma.course.create({
        data: {
            title: 'Основы Веб-Разработки: HTML, CSS, JavaScript',
            description: 'Полный курс для начинающих по веб-разработке. Вы изучите HTML5, CSS3, JavaScript ES6+ и создадите свой первый веб-сайт. Курс включает практические задания, квизы и проект.',
            slug: 'web-development-fundamentals',
            instructorName: user.name || 'Omnex Instructor',
            authorId: user.id,
            category: 'Программирование',
            tags: ['html', 'css', 'javascript', 'web', 'frontend'],
            level: 'beginner',
            language: 'ru',
            availableLanguages: ['ru', 'en'],
            durationMinutes: 1200,
            price: 0,
            currency: 'RUB',
            isPublished: true,
            isFeatured: true,
            isAIGenerated: false,
            rating: 0,
            reviewsCount: 0,
            enrolledCount: 0,
            formats: ['text', 'quiz'],
            modules: {
                create: [
                    {
                        title: 'Модуль 1: Введение в HTML',
                        description: 'Основы HTML: теги, атрибуты, структура документа',
                        orderIndex: 0,
                        durationMinutes: 180,
                        lessons: {
                            create: [
                                {
                                    title: 'Что такое HTML?',
                                    type: 'text',
                                    format: 'text',
                                    content: '# Что такое HTML?\n\nHTML (HyperText Markup Language) — это язык разметки, который используется для создания веб-страниц.\n\n## Основные теги\n\n- `<html>` — корневой элемент\n- `<head>` — метаданные\n- `<body>` — видимое содержимое\n- `<h1>` - `<h6>` — заголовки\n- `<p>` — параграф\n- `<a>` — ссылка\n- `<img>` — изображение\n\n## Пример\n\n```html\n<!DOCTYPE html>\n<html lang="ru">\n<head>\n    <title>Моя первая страница</title>\n</head>\n<body>\n    <h1>Привет, мир!</h1>\n    <p>Это моя первая веб-страница.</p>\n</body>\n</html>\n```',
                                    durationMinutes: 30,
                                    orderIndex: 0,
                                },
                                {
                                    title: 'Структура HTML-документа',
                                    type: 'text',
                                    format: 'text',
                                    content: '# Структура HTML-документа\n\nКаждый HTML-документ состоит из:\n\n1. **DOCTYPE** — объявление типа документа\n2. **html** — корневой элемент с атрибутом `lang`\n3. **head** — служебная информация (title, meta, link, style)\n4. **body** — видимое содержимое страницы\n\n## Семантические теги HTML5\n\n- `<header>` — шапка\n- `<nav>` — навигация\n- `<main>` — основной контент\n- `<section>` — секция\n- `<article>` — статья\n- `<aside>` — боковая панель\n- `<footer>` — подвал',
                                    durationMinutes: 25,
                                    orderIndex: 1,
                                },
                            ],
                        },
                    },
                    {
                        title: 'Модуль 2: Стилизация с CSS',
                        description: 'CSS-селекторы, свойства, Flexbox и Grid',
                        orderIndex: 1,
                        durationMinutes: 240,
                        lessons: {
                            create: [
                                {
                                    title: 'Введение в CSS',
                                    type: 'text',
                                    format: 'text',
                                    content: '# Введение в CSS\n\nCSS (Cascading Style Sheets) — это язык стилей для оформления HTML-документов.\n\n## Способы подключения CSS\n\n1. **Inline** — атрибут `style`\n2. **Internal** — тег `<style>` в `<head>`\n3. **External** — файл `.css` через `<link>`\n\n## Базовые свойства\n\n```css\nbody {\n    font-family: Arial, sans-serif;\n    background-color: #f5f5f5;\n    color: #333;\n}\n\nh1 {\n    color: #2563eb;\n    font-size: 2rem;\n}\n```',
                                    durationMinutes: 30,
                                    orderIndex: 0,
                                },
                                {
                                    title: 'Flexbox и Grid',
                                    type: 'text',
                                    format: 'text',
                                    content: '# Flexbox и CSS Grid\n\n## Flexbox\n\nFlexbox — одномерная модель расположения.\n\n```css\n.container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    gap: 16px;\n}\n```\n\n## CSS Grid\n\nGrid — двумерная модель расположения.\n\n```css\n.grid {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 20px;\n}\n```',
                                    durationMinutes: 45,
                                    orderIndex: 1,
                                },
                            ],
                        },
                    },
                    {
                        title: 'Модуль 3: JavaScript для начинающих',
                        description: 'Переменные, функции, DOM, события',
                        orderIndex: 2,
                        durationMinutes: 300,
                        lessons: {
                            create: [
                                {
                                    title: 'Основы JavaScript',
                                    type: 'text',
                                    format: 'text',
                                    content: '# Основы JavaScript\n\nJavaScript — язык программирования для веб-страниц.\n\n## Переменные\n\n```javascript\nconst name = "Мир";\nlet count = 0;\n\nconsole.log(`Привет, ${name}!`);\n```\n\n## Функции\n\n```javascript\nfunction greet(name) {\n    return `Привет, ${name}!`;\n}\n\nconst arrow = (x) => x * 2;\n```\n\n## Массивы\n\n```javascript\nconst fruits = ["яблоко", "банан", "апельсин"];\nfruits.forEach(fruit => console.log(fruit));\n```',
                                    durationMinutes: 40,
                                    orderIndex: 0,
                                },
                            ],
                        },
                    },
                ],
            },
        },
        include: {
            modules: {
                include: { lessons: true },
            },
        },
    });

    // Записываем пользователя на курс (enrollment)
    await prisma.enrollment.create({
        data: {
            userId: user.id,
            courseId: course.id,
        },
    });

    console.log('\n✅ Курс создан успешно!');
    console.log(`   ID: ${course.id}`);
    console.log(`   Название: ${course.title}`);
    console.log(`   Slug: ${course.slug}`);
    console.log(`   Модулей: ${course.modules.length}`);
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    console.log(`   Уроков: ${totalLessons}`);
    console.log(`   Пользователь записан на курс ✅`);
    console.log(`\n🌐 Откройте: http://localhost:3000/courses/${course.slug}`);
}

main()
    .catch((e) => {
        console.error('❌ Ошибка:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
