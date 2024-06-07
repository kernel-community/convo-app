The best place to stay updated on all things Convo that are currently in the pipeline or I'm musing on is the [Discussions](https://github.com/kernel-community/convo-app/discussions) tab

### Setup 

1. `docker-compose up -d`: creates a postgres container in docker
2. add vars in your `.env` (See `.env.example`)
3. `npm i`
4. `npx prisma migrate dev`: syncs your local db with the prisma schema
5. `npm run data-reset`: resets the db (useful for later too)
6. `npm run dev`

Please reach out if you're looking to set up the app locally and need guidance (https://t.me/probablyangg)
