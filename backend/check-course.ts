
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const courseId = '7b9bf5dd-a7f2-479b-a0ef-6e2eac64933b';
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            _count: {
                select: { reviews: true, enrollments: true }
            }
        }
    });

    if (course) {
        console.log('✅ Course found:');
        console.log(`   Title: ${course.title}`);
        console.log(`   Reviews Count in DB: ${course._count.reviews}`);
        console.log(`   Enrollments Count in DB: ${course._count.enrollments}`);
    } else {
        console.log('❌ Course NOT found with ID:', courseId);

        // List all courses if not found
        const allCourses = await prisma.course.findMany({
            select: { id: true, title: true }
        });
        console.log('\nAvailable courses in DB:');
        allCourses.forEach(c => console.log(`- ${c.title} (${c.id})`));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
