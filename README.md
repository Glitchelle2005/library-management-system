# 📚 Library Management System - Data Layer

A robust, type-safe data layer for a modern Library Management System, powered by **PostgreSQL**, **Prisma ORM**, and **NestJS/TypeScript**.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Database Schema & Architecture](#database-schema--architecture)
  - [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
  - [Models & Enum Definition](#models--enum-definition)
- [Schema Decisions](#schema-decisions)
  - [Why Book References Genre via Foreign Key Rather Than Embedding It](#why-book-references-genre-via-foreign-key-rather-than-embedding-it)
- [Prisma vs. Document Database Modeling](#prisma-vs-document-database-modeling)
- [Getting Started & Local Setup](#getting-started--local-setup)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Run Database Migrations](#4-run-database-migrations)
  - [5. Seed Database](#5-seed-database)
- [Prisma Service Integration in NestJS](#prisma-service-integration-in-nestjs)

---

## 📖 Project Overview

This project implements the foundational data layer for a library catalog management system. It provides structured data models for:
- **Users**: Patrons and Librarians governed by a strict role-based access enum (`Role`).
- **Genres**: Distinct literary classifications (e.g., Science Fiction, Fantasy, Mystery).
- **Books**: Cataloged inventory items linked to a Genre via relational foreign keys.
- **Reviews (Stretch Goal)**: Community evaluations linking Patrons to specific Books with rating scores and commentary.

---

## 🗂️ Repository Structure

```text
library-management-system/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema (Role enum, User, Genre, Book, Review)
│   │   └── seed.ts                  # Database seeder (5 genres, 20 books, users, reviews)
│   ├── src/
│   │   └── prisma/
│   │       ├── prisma.service.ts    # PrismaService extending PrismaClient & implementing OnModuleInit
│   │       └── prisma.module.ts     # Global NestJS module exporting PrismaService
│   ├── .env.example                 # Template for environment variables (DATABASE_URL placeholder)
│   ├── package.json                 # Dependencies, Prisma seeding configurations & scripts
│   └── tsconfig.json                # TypeScript compiler configuration
├── .gitignore                       # Ensures .env, credentials, and node_modules are never committed
└── README.md                        # Documentation and schema architectural decisions
```

---

## 🗄️ Database Schema & Architecture

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ROLE {
        string PATRON
        string LIBRARIAN
    }

    User {
        int id PK
        string email UK
        string name
        ROLE role
        DateTime createdAt
        DateTime updatedAt
    }

    Genre {
        int id PK
        string name UK
        string description
        DateTime createdAt
        DateTime updatedAt
    }

    Book {
        int id PK
        string title
        string author
        string isbn UK
        string description
        int publishedYear
        int availableCopies
        int totalCopies
        int genreId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Review {
        int id PK
        int rating
        string comment
        int bookId FK
        int userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Genre ||--o{ Book : "categorizes (1:N)"
    Book ||--o{ Review : "receives (1:N)"
    User ||--o{ Review : "writes (1:N)"
```

### Models & Enum Definition

1. **`Role` (Enum)**:
   - `PATRON`: Standard library member capable of borrowing books and posting reviews.
   - `LIBRARIAN`: Administrative user authorized to manage catalog records, authors, and circulation.

2. **`User` (Model)**:
   - Represents platform users. Enforces unique email constraints and default role assignment (`PATRON`).

3. **`Genre` (Model)**:
   - Represents book categories with unique names (`name String @unique`) and an optional description.

4. **`Book` (Model)**:
   - Represents catalog titles. Contains metadata (title, author, ISBN, published year, stock count) and references its parent category via `genreId` referencing `Genre(id)`.

5. **`Review` (Model - Stretch Goal)**:
   - Connects `Book` and `User` in a many-to-one relationship, recording numeric ratings (1–5) and optional textual reviews.

---

## Schema Decisions

### Why Book References Genre via Foreign Key Rather Than Embedding It

In relational data modeling (and relational databases like PostgreSQL), we intentionally model `Genre` as an independent entity and reference it from `Book` via a `genreId` foreign key with `@relation(fields: [genreId], references: [id])`, rather than embedding genre information (such as a raw string or embedded object) inside each `Book` record.

Here is the architectural rationale:

1. **Elimination of Data Redundancy and Inconsistency (Third Normal Form - 3NF)**:
   - If genre names were stored directly on each book as free-form strings, discrepancies inevitably arise (e.g., `"Sci-Fi"`, `"SciFi"`, `"Science Fiction"`, `"science fiction"`).
   - By creating a separate `Genre` table with a unique constraint on `name`, the genre is defined in exactly one place. This creates a **single source of truth**.

2. **Atomic and Cascading Updates**:
   - If the library decides to rename `"Science Fiction"` to `"Sci-Fi & Speculative Fiction"`, or update its descriptive overview, normalizing the genre allows this to be accomplished in a single `UPDATE genres SET name = ... WHERE id = ...` query.
   - If genres were embedded in each book row, renaming a genre would require updating thousands of individual book records across the entire catalog, incurring significant I/O overhead, potential locking contention, and risk of partial update failures.

3. **Independent Entity Lifecycle & Extensibility**:
   - A genre exists as a concept independent of whether books currently belong to it (e.g., creating a new `"Artificial Intelligence"` section before books arrive).
   - In the future, genres can easily be extended with additional relational attributes without bloating the `Book` table—such as `shelfLocation`, `ageRestriction`, `deweyDecimalRange`, or hierarchical parent-child relationships (sub-genres).

4. **Query Performance & Index Efficiency**:
   - Foreign key indexing on an integer or UUID (`genreId`) is substantially more compact and faster for the PostgreSQL query planner than indexing lengthy textual strings across millions of book records.
   - Aggregations (e.g., `COUNT(*)` of books per genre, finding genres with zero inventory) become straightforward, high-performance relational joins (`JOIN` / `GROUP BY`).

5. **Referential Integrity**:
   - The `@relation` directive enforces foreign key constraints at the database level. PostgreSQL guarantees that a book cannot reference a non-existent `genreId`, preventing orphaned catalog entries.

---

## 🔄 Prisma vs. Document Database Modeling

### Note on Modeling in Prisma (Relational) vs. Document Databases (e.g., MongoDB)

| Aspect | Relational Modeling with Prisma (PostgreSQL) | Document Database (e.g., MongoDB / Firestore) |
| :--- | :--- | :--- |
| **Data Normalization** | Strongly normalized. Entities are separated into distinct tables and linked by foreign keys (`@relation`). | Typically denormalized. One-to-many relationships are frequently embedded directly as subdocuments inside the parent document. |
| **Referential Integrity** | Enforced by the database engine (foreign key constraints, cascade rules, unique indexes). | Enforced primarily at the application tier; database engine does not inherently prevent orphaned references across collections. |
| **Data Duplication vs. Read Latency** | Prioritizes zero duplication and write consistency. Reads require SQL `JOIN`s (efficiently handled by Prisma's `include` API). | Prioritizes fast single-document read lookups by embedding related data, at the cost of duplicate data synchronization on updates. |
| **Schema Evolution** | Rigorous declarative migrations (`prisma migrate dev`). Any structural change produces tracked, repeatable SQL migration files. | Schema-flexible / schemaless. Field additions or shape changes do not strictly require running database-level migrations upfront. |

**Key Takeaway**:  
Modeling in Prisma for PostgreSQL provides compile-time type safety and strict schema contracts. When you change a relation or field in `schema.prisma` and run `prisma generate`, TypeScript immediately flags any query throughout your entire codebase that does not conform to the updated schema.

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A hosted PostgreSQL instance (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), [Render](https://render.com), or [Railway](https://railway.app))

### 2. Environment Configuration

Navigate to the `api` directory:

```bash
cd api
```

Create a `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your actual PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@your-host.provider.com:5432/library_db?sslmode=require"
```

> **Security Note**: Never commit `.env` containing live database credentials to version control. The `.gitignore` is pre-configured to keep your secrets private.

### 3. Install Dependencies

Install the project dependencies and Prisma CLI:

```bash
npm install
```

### 4. Run Database Migrations

Apply the Prisma schema to your hosted PostgreSQL database:

```bash
# Push schema or create a versioned migration
npx prisma migrate dev --name init
```

*Alternative (if connecting directly to a remote hosted instance without migration history):*

```bash
npx prisma db push
```

Generate the typed Prisma Client:

```bash
npx prisma generate
```

### 5. Seed Database

Populate your database with the required seed data (5 genres, 20 books, users with PATRON and LIBRARIAN roles, and reviews):

```bash
npx prisma db seed
```

Output:
```text
🌱 Starting database seeding...
✅ Seeded 5 genres successfully.
✅ Seeded 20 books successfully.
✅ Seeded users: Sarah Connor (LIBRARIAN), John Doe (PATRON).
✅ Seeded sample review.
🎉 Seeding completed successfully!
```

You can view and inspect the seeded data interactively in your browser with **Prisma Studio**:

```bash
npx prisma studio
```

---

## 🧩 Prisma Service Integration in NestJS

The application includes a ready-to-use `PrismaService` under `api/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

This service extends `PrismaClient` and leverages NestJS's `OnModuleInit` lifecycle hook to automatically establish database connections when the application boots up. It is packaged in `PrismaModule` for dependency injection across controllers and services.

