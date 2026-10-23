const { query } = require('./pool');
const { migrate } = require('./migrate');

// Factories for creating test / mock data
const userFactory = (overrides = {}) => ({
  name: 'Ayşe Yılmaz',
  email: `ayse.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`,
  graduation_year: 2022,
  department: 'Management Information Systems',
  ...overrides,
});

const announcementFactory = (overrides = {}) => ({
  title: 'Alumni Reunion 2026',
  content: 'Annual gathering of Istanbul University MIS graduates.',
  author: 'Secretariat',
  category: 'Event',
  ...overrides,
});

const initialUsers = [
  { name: 'Ayşe Yılmaz', email: 'ayse@example.com', graduation_year: 2022, department: 'Management Information Systems' },
  { name: 'Mehmet Kaya', email: 'mehmet@example.com', graduation_year: 2021, department: 'Management Information Systems' },
  { name: 'Zeynep Demir', email: 'zeynep@example.com', graduation_year: 2023, department: 'Economics' },
];

const initialAnnouncements = [
  {
    title: 'Spring Alumni Meetup',
    content: 'We welcome all graduates to our Beyazıt campus on May 15th.',
    author: 'IU Alumni Relations',
    category: 'Event',
  },
  {
    title: 'Junior Developer Openings at Tech Partner',
    content: 'Exciting opportunities for recent MIS graduates in frontend & backend development.',
    author: 'Career Center',
    category: 'Job',
  },
];

async function seed() {
  await migrate();
  console.log('Seeding initial data...');

  try {
    for (const u of initialUsers) {
      await query(
        `INSERT INTO users (name, email, graduation_year, department)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING;`,
        [u.name, u.email, u.graduation_year, u.department]
      );
    }

    for (const a of initialAnnouncements) {
      await query(
        `INSERT INTO announcements (title, content, author, category)
         VALUES ($1, $2, $3, $4);`,
        [a.title, a.content, a.author, a.category]
      );
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed, userFactory, announcementFactory };

