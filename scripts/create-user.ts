import { hashPassword } from "../lib/auth";
import { prisma } from "../lib/db";

async function main() {
  const email = process.argv[2] ?? process.env.SEED_EMAIL;
  const password = process.argv[3] ?? process.env.SEED_PASSWORD;
  const displayName = process.argv[4] ?? process.env.SEED_DISPLAY_NAME ?? "Me";

  if (!email || !password) {
    console.error("Usage: npm run create-user -- <email> <password> [displayName]");
    console.error("   or set SEED_EMAIL and SEED_PASSWORD in .env");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, displayName },
    create: { email, passwordHash, displayName },
  });

  console.log(`User ready: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
