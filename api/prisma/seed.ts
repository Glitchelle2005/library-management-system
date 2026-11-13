import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Genres (At least 4 required - seeding 5 genres)
  const genresData = [
    {
      name: 'Science Fiction',
      description: 'Speculative fiction exploring futuristic technology, space exploration, time travel, and parallel universes.',
    },
    {
      name: 'Fantasy',
      description: 'Imaginative fiction featuring magical elements, mythical creatures, and wondrous world-building.',
    },
    {
      name: 'Mystery & Thriller',
      description: 'Fast-paced, suspenseful narratives centered around solving crimes, secrets, and high-stakes investigations.',
    },
    {
      name: 'Historical Fiction',
      description: 'Stories set in recognizable historical eras capturing authentic societal and cultural nuances.',
    },
    {
      name: 'Non-Fiction & Computer Science',
      description: 'Educational, technical, and analytical literature spanning technology, engineering, and human history.',
    },
  ];

  const createdGenres = [];
  for (const genre of genresData) {
    const record = await prisma.genre.upsert({
      where: { name: genre.name },
      update: { description: genre.description },
      create: genre,
    });
    createdGenres.push(record);
  }
  console.log(`✅ Seeded ${createdGenres.length} genres successfully.`);

  const [sciFi, fantasy, mystery, historical, nonFiction] = createdGenres;

  // 2. Seed Books (At least 15 required - seeding 20 books distributed across all 5 genres)
  const booksData = [
    // --- Science Fiction ---
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441172719',
      description: 'Set on the harsh desert planet Arrakis, Paul Atreides navigates prophecy, ecology, and political intrigue.',
      publishedYear: 1965,
      availableCopies: 3,
      totalCopies: 4,
      genreId: sciFi.id,
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '978-0441569595',
      description: 'A washed-up computer hacker is hired for one last job targeting a powerful artificial intelligence.',
      publishedYear: 1984,
      availableCopies: 2,
      totalCopies: 2,
      genreId: sciFi.id,
    },
    {
      title: 'Foundation',
      author: 'Isaac Asimov',
      isbn: '978-0553293357',
      description: 'Psychohistorian Hari Seldon foresaw the fall of the Galactic Empire and set out to preserve human knowledge.',
      publishedYear: 1951,
      availableCopies: 4,
      totalCopies: 5,
      genreId: sciFi.id,
    },
    {
      title: 'Snow Crash',
      author: 'Neal Stephenson',
      isbn: '978-0553380958',
      description: 'In a neon-lit franchise-dominated future, a pizza delivery hacker battles a digital and biological mind-virus.',
      publishedYear: 1992,
      availableCopies: 1,
      totalCopies: 3,
      genreId: sciFi.id,
    },

    // --- Fantasy ---
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '978-0547928227',
      description: 'Bilbo Baggins leaves the Shire alongside Gandalf and thirteen dwarves to reclaim the Lonely Mountain.',
      publishedYear: 1937,
      availableCopies: 5,
      totalCopies: 5,
      genreId: fantasy.id,
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      isbn: '978-0553103540',
      description: 'A dynastic struggle for the Iron Throne erupts across the continents of Westeros and Essos.',
      publishedYear: 1996,
      availableCopies: 2,
      totalCopies: 4,
      genreId: fantasy.id,
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '978-0756404741',
      description: 'The first-person memoir of Kvothe, an orphan boy who became an accomplished arcanist, musician, and legend.',
      publishedYear: 2007,
      availableCopies: 3,
      totalCopies: 3,
      genreId: fantasy.id,
    },
    {
      title: 'The Way of Kings',
      author: 'Brandon Sanderson',
      isbn: '978-0765326355',
      description: 'Highprinces clash on the Shattered Plains while ancient surgebinding powers slowly awaken.',
      publishedYear: 2010,
      availableCopies: 2,
      totalCopies: 4,
      genreId: fantasy.id,
    },

    // --- Mystery & Thriller ---
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '978-0307949486',
      description: 'Investigative journalist Mikael Blomkvist and genius hacker Lisbeth Salander uncover decades-old corporate secrets.',
      publishedYear: 2005,
      availableCopies: 4,
      totalCopies: 4,
      genreId: mystery.id,
    },
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '978-0062073488',
      description: 'Ten strangers are stranded on an isolated island mansion and murdered one by one according to a nursery rhyme.',
      publishedYear: 1939,
      availableCopies: 3,
      totalCopies: 3,
      genreId: mystery.id,
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '978-0307588371',
      description: 'On their fifth wedding anniversary, Amy Dunne vanishes, and husband Nick becomes the prime suspect in a media frenzy.',
      publishedYear: 2012,
      availableCopies: 2,
      totalCopies: 3,
      genreId: mystery.id,
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      isbn: '978-0307474278',
      description: 'Symbologist Robert Langdon investigates a murder in the Louvre, tracing religious history and secret societies.',
      publishedYear: 2003,
      availableCopies: 4,
      totalCopies: 5,
      genreId: mystery.id,
    },

    // --- Historical Fiction ---
    {
      title: 'The Book Thief',
      author: 'Markus Zusak',
      isbn: '978-0375842207',
      description: 'Narrated by Death, young Liesel Meminger discovers the transformative power of words in Nazi Germany.',
      publishedYear: 2005,
      availableCopies: 3,
      totalCopies: 3,
      genreId: historical.id,
    },
    {
      title: 'All the Light We Cannot See',
      author: 'Anthony Doerr',
      isbn: '978-1476746586',
      description: 'The parallel journeys of a blind French girl and an engineering-minded German orphan soldier during WWII.',
      publishedYear: 2014,
      availableCopies: 2,
      totalCopies: 3,
      genreId: historical.id,
    },
    {
      title: 'The Pillars of the Earth',
      author: 'Ken Follett',
      isbn: '978-0451166890',
      description: 'A master builder, monks, and nobility navigate war and ambition while constructing a magnificent Gothic cathedral.',
      publishedYear: 1989,
      availableCopies: 2,
      totalCopies: 2,
      genreId: historical.id,
    },
    {
      title: 'A Gentleman in Moscow',
      author: 'Amor Towles',
      isbn: '978-0143110439',
      description: 'Count Alexander Rostov is sentenced by a Bolshevik tribunal to spend the rest of his life inside the Hotel Metropol.',
      publishedYear: 2016,
      availableCopies: 3,
      totalCopies: 4,
      genreId: historical.id,
    },

    // --- Non-Fiction & Computer Science ---
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      description: 'Essential software craftsmanship guidelines on writing readable, testable, and maintainable systems.',
      publishedYear: 2008,
      availableCopies: 4,
      totalCopies: 5,
      genreId: nonFiction.id,
    },
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '978-0201633610',
      description: 'Foundational architectural catalog presenting 23 classic software design patterns.',
      publishedYear: 1994,
      availableCopies: 2,
      totalCopies: 3,
      genreId: nonFiction.id,
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      description: 'Deep dive into data models, replication, partitioning, consensus, and building resilient distributed storage.',
      publishedYear: 2017,
      availableCopies: 3,
      totalCopies: 3,
      genreId: nonFiction.id,
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      description: 'Examines the cognitive, agricultural, and scientific revolutions shaping human history and modern society.',
      publishedYear: 2014,
      availableCopies: 5,
      totalCopies: 5,
      genreId: nonFiction.id,
    },
  ];

  for (const book of booksData) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        description: book.description,
        publishedYear: book.publishedYear,
        availableCopies: book.availableCopies,
        totalCopies: book.totalCopies,
        genreId: book.genreId,
      },
      create: book,
    });
  }
  console.log(`✅ Seeded ${booksData.length} books successfully.`);

  // 3. Seed Users with PATRON and LIBRARIAN roles
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const librarian = await prisma.user.upsert({
    where: { email: 'head.librarian@library.org' },
    update: {
      password: defaultPassword,
    },
    create: {
      name: 'Sarah Connor',
      email: 'head.librarian@library.org',
      password: defaultPassword,
      role: Role.LIBRARIAN,
    },
  });

  const patron = await prisma.user.upsert({
    where: { email: 'patron.john@example.com' },
    update: {
      password: defaultPassword,
    },
    create: {
      name: 'John Doe',
      email: 'patron.john@example.com',
      password: defaultPassword,
      role: Role.PATRON,
    },
  });
  console.log(`✅ Seeded users: ${librarian.name} (${librarian.role}), ${patron.name} (${patron.role}).`);

  // 4. Seed Reviews (Stretch goal)
  const duneBook = await prisma.book.findUnique({ where: { isbn: '978-0441172719' } });
  if (duneBook) {
    const existingReview = await prisma.review.findFirst({
      where: { bookId: duneBook.id, userId: patron.id },
    });
    if (!existingReview) {
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Incredible sci-fi masterpiece. The world-building and political dynamics are unmatched.',
          bookId: duneBook.id,
          userId: patron.id,
        },
      });
      console.log('✅ Seeded sample review.');
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

