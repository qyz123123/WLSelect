import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoTeacherEmails = ["reyes@wlselect.edu", "lin@wlselect.edu"];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: demoTeacherEmails
      }
    },
    select: {
      id: true,
      email: true
    }
  });

  if (users.length === 0) {
    console.log("No demo teachers found.");
    return;
  }

  const deleted = await prisma.user.deleteMany({
    where: {
      id: {
        in: users.map((user) => user.id)
      }
    }
  });

  console.log(`Removed ${deleted.count} demo teacher accounts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
