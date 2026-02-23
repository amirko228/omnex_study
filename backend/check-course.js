const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courseId = '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b';

    const course = await prisma.course.findUnique({
        where: { id: courseId }
    });

    if (course) {
        console.log(`Course ${courseId} already exists:`, course.title);
    } else {
        console.log(`Course ${courseId} not found. Creating it...`);
        const newCourse = await prisma.course.create({
            data: {
                id: courseId,
                title: 'Основы Веб-Разработки: HTML, CSS, JavaScript',
                description: 'Полный курс для начинающих по веб-разработке. Вы изучите HTML5, CSS3, JavaScript ES6+ и создадите свой первый веб-сайт.',
                difficulty: 'BEGINNER',
                thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
                coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
                price: 0,
                currency: 'RUB',
                isPublished: true,
                authorId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || (await prisma.user.findFirst())?.id
            }
        });
        console.log('Course created successfully:', newCourse.id);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
