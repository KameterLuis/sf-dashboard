This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database

Revenue aus TRES
Bankaccount + Fremdwährungskonto
Finway mit Startbalance
TRES Transaction + Balance data
DATEV

## Updating Database Structure

1. Update schema.prisma
2. npx prisma generate
3. npx prisma migrate reset --skip-seed
4. npx prisma reset
5. npx prisma migrate dev --name some_name
6. npx prisma migrate deploy
7. npx prisma db seed

## Reset

mkdir -p prisma/migrations/20250820
npx prisma migrate diff \
 --from-migrations prisma/migrations \
 --to-schema-datamodel prisma/schema.prisma \
 --script > prisma/migrations/20250818_add_users/migration.sql

docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up

## Running locally

change .env to DATABASE_URL=postgresql://app:secret@localhost:5432/mydb
run docker compose up -d db
run these:

- npm install
- npx prisma generate
- npx prisma migrate dev --name init
- npx prisma db seed
- npm run dev

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
