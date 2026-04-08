import { PrismaClient } from "@prisma/client";

import { syncCommentCounts } from "../lib/comment-counts";

const prisma = new PrismaClient();

async function main() {
  await syncCommentCounts(prisma);
  console.log("Comment counts synced.");
}

main()
  .catch((error) => {
    console.error("Failed to sync comment counts.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
