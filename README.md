## Dev

1. `docker-compose up -d`: creates a postgres container in docker
2. add vars in your `.env` (See `.env.example`)
3. `npm i`
4. `npx prisma migrate dev`: syncs your local db with the prisma schema
5. `npm run data-reset`: resets the db (useful for later too) and seeds it with test data
6. `npm run dev`
