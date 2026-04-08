npm install
npm run db:up
npm run db:push
if node - <<'NODE'
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const [userCount, teacherCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.teacherProfile.count(),
    prisma.comment.count()
  ]);

  await prisma.$disconnect();

  process.exit(userCount === 0 && teacherCount === 0 && commentCount === 0 ? 0 : 1);
})().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
NODE
then
  npm run seed
  npm run courses:sync
  npm run teachers:remove-demo
else
  echo "Existing database content detected. Skipping destructive seed/bootstrap steps."
fi
npm run comments:sync
npm run dev
