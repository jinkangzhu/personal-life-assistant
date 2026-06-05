import { hashPassword } from "../lib/auth";
import { prisma } from "../lib/db";

async function main() {
  const email = process.env.SEED_EMAIL ?? "me@example.com";
  const password = process.env.SEED_PASSWORD ?? "changeme123";
  const displayName = process.env.SEED_DISPLAY_NAME ?? "Me";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User already exists: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      categories: {
        create: [
          { name: "前端", sortOrder: 0 },
          { name: "AI", sortOrder: 1 },
          { name: "生活", sortOrder: 2 },
        ],
      },
    },
  });

  console.log(`Created user: ${user.email} (${user.id})`);
  console.log("Default password from SEED_PASSWORD env or 'changeme123'");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
