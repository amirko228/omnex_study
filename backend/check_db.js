
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Diagnostic ---');

    const reviewsCount = await prisma.review.count();
    console.log('Total reviews:', reviewsCount);

    const reviews = await prisma.review.findMany({
        include: {
            user: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, title: true } }
        }
    });

    console.log('Reviews detail:');
    reviews.forEach(r => {
        console.log(`- Review by ${r.user.name} (${r.user.id}) for course ${r.course.title} (${r.course.id}): rating=${r.rating}`);
    });

    const courses = await prisma.course.findMany({
        select: { id: true, title: true }
    });
    console.log('\nAvailable courses in DB:');
    courses.forEach(c => console.log(`- ${c.id}: ${c.title}`));

    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
