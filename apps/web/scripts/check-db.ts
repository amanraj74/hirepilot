import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('--- Checking DB State (Fixed) ---');

  const users = await prisma.user.count();
  const companies = await prisma.company.count();
  const audits = await prisma.auditLog.count();
  console.log(`Total Users: ${users} (Expected: 18)`);
  console.log(`Total Companies: ${companies} (Expected: 5)`);
  console.log(`Total Audit Entries: ${audits} (Expected: 21)`);

  const recruiterHpJobs = await prisma.job.count({
    where: { company: { slug: 'hirepilot-demo' } },
  });
  console.log(`HirePilot Jobs: ${recruiterHpJobs} (Expected: 7)`);

  const acmeJobs = await prisma.job.count({
    where: { company: { slug: 'acme-corp' } },
  });
  console.log(`Acme Jobs: ${acmeJobs} (Expected: 6)`);

  const nwJobs = await prisma.job.count({
    where: { company: { slug: 'northwind-tech' } },
  });
  console.log(`Northwind Jobs: ${nwJobs} (Expected: 6)`);

  const arjun = await prisma.user.findUnique({ where: { email: 'arjun.candidate@test.dev' } });
  if (arjun) {
    const arjunApps = await prisma.application.findMany({
      where: { candidateId: arjun.id },
      include: { job: { include: { company: true } } },
    });
    console.log(`Arjun Applications: ${arjunApps.length} (Expected: 6)`);
    console.log(
      `Arjun Offers:`,
      arjunApps.filter((a) => a.stage === 'OFFER').map((a) => a.job.company.name),
    );
  }

  const priya = await prisma.user.findUnique({ where: { email: 'priya.candidate@test.dev' } });
  if (priya) {
    const priyaApps = await prisma.application.findMany({
      where: { candidateId: priya.id },
      include: { job: { include: { company: true } } },
    });
    console.log(`Priya Applications: ${priyaApps.length} (Expected: 5)`);
    console.log(
      `Priya Hired:`,
      priyaApps.filter((a) => a.stage === 'HIRED').map((a) => a.job.company.name),
    );
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
