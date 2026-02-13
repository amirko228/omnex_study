// ============================================================================
// DATABASE SEED — Начальные данные для разработки
// Запуск: npx prisma db seed
// ============================================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Заполнение базы данных начальными данными...');

    // ==========================================
    // 1. Администратор
    // ==========================================
    const adminPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@omnex.study' },
        update: {},
        create: {
            email: 'admin@omnex.study',
            passwordHash: adminPassword,
            name: 'Администратор',
            role: 'admin',
            emailVerified: true,
            subscriptionPlan: 'enterprise',
            locale: 'ru',
            bio: 'Главный администратор платформы Omnex Study',
        },
    });
    console.log(`✅ Админ: ${admin.email}`);

    // ==========================================
    // 2. Тестовый пользователь
    // ==========================================
    const userPassword = await bcrypt.hash('user123', 12);

    const user = await prisma.user.upsert({
        where: { email: 'user@omnex.study' },
        update: {},
        create: {
            email: 'user@omnex.study',
            passwordHash: userPassword,
            name: 'Иван Иванов',
            role: 'user',
            emailVerified: true,
            subscriptionPlan: 'free',
            locale: 'ru',
            bio: 'Тестовый пользователь для разработки',
        },
    });
    console.log(`✅ Пользователь: ${user.email}`);

    // ==========================================
    // 3. Тестовые курсы
    // ==========================================
    const course1 = await prisma.course.upsert({
        where: { slug: 'javascript-fundamentals' },
        update: {},
        create: {
            title: 'JavaScript: Основы программирования',
            slug: 'javascript-fundamentals',
            description: 'Полный курс по основам JavaScript — от переменных до асинхронного программирования. Идеально подходит для начинающих разработчиков.',
            category: 'programming',
            level: 'beginner',
            language: 'ru',
            price: 0,
            currency: 'RUB',
            isPublished: true,
            isFeatured: true,
            authorId: admin.id,
            rating: 4.8,
            reviewsCount: 125,
            enrolledCount: 1450,
            durationMinutes: 480,
            formats: ['text', 'quiz', 'chat'],
            tags: ['javascript', 'web', 'frontend', 'programming'],
        },
    });

    const course2 = await prisma.course.upsert({
        where: { slug: 'python-data-science' },
        update: {},
        create: {
            title: 'Python для Data Science',
            slug: 'python-data-science',
            description: 'Научитесь анализировать данные с помощью Python, pandas, NumPy и matplotlib. Реальные проекты и кейсы.',
            category: 'data-science',
            level: 'intermediate',
            language: 'ru',
            price: 2990,
            currency: 'RUB',
            isPublished: true,
            isFeatured: true,
            authorId: admin.id,
            rating: 4.6,
            reviewsCount: 89,
            enrolledCount: 890,
            durationMinutes: 720,
            formats: ['text', 'quiz', 'assignment'],
            tags: ['python', 'data-science', 'pandas', 'machine-learning'],
        },
    });

    const course3 = await prisma.course.upsert({
        where: { slug: 'react-nextjs-fullstack' },
        update: {},
        create: {
            title: 'React + Next.js: Fullstack разработка',
            slug: 'react-nextjs-fullstack',
            description: 'Создание современных веб-приложений с React и Next.js. SSR, API Routes, Auth, Deployment.',
            category: 'programming',
            level: 'advanced',
            language: 'ru',
            price: 4990,
            currency: 'RUB',
            isPublished: true,
            isFeatured: false,
            authorId: admin.id,
            rating: 4.9,
            reviewsCount: 67,
            enrolledCount: 520,
            durationMinutes: 960,
            formats: ['text', 'quiz', 'chat', 'assignment'],
            tags: ['react', 'nextjs', 'fullstack', 'typescript'],
        },
    });

    console.log(`✅ Курсы: ${course1.title}, ${course2.title}, ${course3.title}`);

    // ==========================================
    // 4. Модули и уроки для курса JS
    // ==========================================
    const module1 = await prisma.courseModule.create({
        data: {
            courseId: course1.id,
            title: 'Введение в JavaScript',
            description: 'Основы языка: переменные, типы данных, операторы',
            orderIndex: 0,
            lessons: {
                create: [
                    {
                        title: 'Что такое JavaScript?',
                        type: 'text',
                        format: 'text',
                        content: `# Что такое JavaScript?

JavaScript — это высокоуровневый, интерпретируемый язык программирования. Он является одним из трёх основных технологий World Wide Web наряду с HTML и CSS.

## История создания

JavaScript был создан Бренданом Айком в 1995 году в компании Netscape. Изначально язык назывался LiveScript, но был переименован в JavaScript из маркетинговых соображений.

## Где используется JavaScript?

- **Фронтенд**: Интерактивные веб-страницы, анимации, SPA
- **Бэкенд**: Node.js, Deno, Bun
- **Мобильные приложения**: React Native, Ionic
- **Десктоп**: Electron
- **IoT**: Johnny-Five

## Ваш первый код

\`\`\`javascript
console.log('Привет, мир!');
\`\`\`

Откройте консоль разработчика в браузере (F12) и попробуйте выполнить эту команду.`,
                        durationMinutes: 15,
                        orderIndex: 0,
                    },
                    {
                        title: 'Переменные и типы данных',
                        type: 'text',
                        format: 'text',
                        content: `# Переменные и типы данных

## Объявление переменных

В JavaScript есть три способа объявить переменную:

\`\`\`javascript
let age = 25;        // Можно изменять
const name = 'Иван'; // Константа
var old = true;      // Устаревший способ
\`\`\`

## Типы данных

JavaScript имеет 8 типов данных:

1. **string** — строки: \`'Привет'\`
2. **number** — числа: \`42\`, \`3.14\`
3. **boolean** — логический: \`true\`, \`false\`
4. **null** — пустое значение
5. **undefined** — неопределённое значение
6. **bigint** — большие числа: \`9007199254740991n\`
7. **symbol** — уникальный идентификатор
8. **object** — объекты, массивы, функции`,
                        durationMinutes: 25,
                        orderIndex: 1,
                    },
                    {
                        title: 'Операторы и выражения',
                        type: 'text',
                        format: 'text',
                        content: `# Операторы и выражения

## Арифметические операторы
\`\`\`javascript
let a = 10 + 5;  // 15 — сложение
let b = 10 - 5;  // 5  — вычитание
let c = 10 * 5;  // 50 — умножение
let d = 10 / 5;  // 2  — деление
let e = 10 % 3;  // 1  — остаток от деления
let f = 2 ** 3;  // 8  — возведение в степень
\`\`\`

## Операторы сравнения
\`\`\`javascript
5 == '5'   // true — нестрогое сравнение
5 === '5'  // false — строгое сравнение (рекомендуется!)
5 !== 3    // true
5 > 3      // true
\`\`\``,
                        durationMinutes: 20,
                        orderIndex: 2,
                    },
                ],
            },
        },
    });

    const module2 = await prisma.courseModule.create({
        data: {
            courseId: course1.id,
            title: 'Управление потоком выполнения',
            description: 'Условия, циклы, функции',
            orderIndex: 1,
            lessons: {
                create: [
                    {
                        title: 'Условные конструкции (if/else)',
                        type: 'text',
                        format: 'text',
                        content: `# Условные конструкции

## if / else
\`\`\`javascript
const age = 18;

if (age >= 18) {
  console.log('Вы совершеннолетний');
} else {
  console.log('Вам ещё нет 18');
}
\`\`\`

## Тернарный оператор
\`\`\`javascript
const status = age >= 18 ? 'взрослый' : 'несовершеннолетний';
\`\`\`

## switch
\`\`\`javascript
switch (day) {
  case 'Monday': console.log('Понедельник'); break;
  case 'Friday': console.log('Пятница!'); break;
  default: console.log('Обычный день');
}
\`\`\``,
                        durationMinutes: 20,
                        orderIndex: 0,
                    },
                    {
                        title: 'Циклы (for, while)',
                        type: 'text',
                        format: 'text',
                        content: `# Циклы

## for
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

## while
\`\`\`javascript
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}
\`\`\`

## for...of (для массивов)
\`\`\`javascript
const fruits = ['яблоко', 'банан', 'апельсин'];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\``,
                        durationMinutes: 25,
                        orderIndex: 1,
                    },
                ],
            },
        },
    });

    console.log(`✅ Модули и уроки: ${module1.title}, ${module2.title}`);

    // ==========================================
    // 5. Квиз для первого модуля
    // ==========================================
    const lesson1 = await prisma.lesson.findFirst({
        where: { moduleId: module1.id, orderIndex: 1 },
    });

    if (lesson1) {
        await prisma.quiz.create({
            data: {
                lessonId: lesson1.id,
                title: 'Тест: Переменные и типы данных',
                passingScore: 70,
                questions: {
                    create: [
                        {
                            question: 'Какое ключевое слово используется для объявления константы?',
                            options: ['let', 'var', 'const', 'define'],
                            correctAnswer: 2,
                            explanation: 'const используется для объявления константы, значение которой нельзя переназначить.',
                            points: 10,
                            orderIndex: 0,
                        },
                        {
                            question: 'Какой тип данных у значения null?',
                            options: ['null', 'undefined', 'object', 'string'],
                            correctAnswer: 2,
                            explanation: 'Это известный баг JavaScript — typeof null возвращает "object", хотя null не является объектом.',
                            points: 10,
                            orderIndex: 1,
                        },
                        {
                            question: 'Сколько типов данных в JavaScript?',
                            options: ['5', '6', '7', '8'],
                            correctAnswer: 3,
                            explanation: '8 типов: string, number, boolean, null, undefined, bigint, symbol, object.',
                            points: 10,
                            orderIndex: 2,
                        },
                    ],
                },
            },
        });
        console.log('✅ Квиз создан');
    }

    // ==========================================
    // 6. Запись пользователя на курс
    // ==========================================
    await prisma.enrollment.create({
        data: { userId: user.id, courseId: course1.id },
    });
    console.log(`✅ ${user.name} записан на "${course1.title}"`);

    // ==========================================
    // 7. Промокод
    // ==========================================
    await prisma.promoCode.upsert({
        where: { code: 'WELCOME50' },
        update: {},
        create: {
            code: 'WELCOME50',
            discountPercent: 50,
            validUntil: new Date('2027-12-31'),
            maxUses: 1000,
        },
    });
    console.log('✅ Промокод WELCOME50 создан (50% скидка)');

    // ==========================================
    // 8. Уведомление
    // ==========================================
    await prisma.notification.create({
        data: {
            userId: user.id,
            type: 'welcome',
            title: 'Добро пожаловать! 🎉',
            message: 'Добро пожаловать на платформу Omnex Study! Начните обучение с нашего курса по JavaScript.',
            channel: 'in-app',
        },
    });
    console.log('✅ Welcome уведомление создано');

    console.log('\n🎉 Seed завершён успешно!');
    console.log('📧 Админ: admin@omnex.study / admin123');
    console.log('📧 Пользователь: user@omnex.study / user123');
}

main()
    .catch((e) => {
        console.error('❌ Ошибка seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
