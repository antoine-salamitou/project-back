FROM node:22-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=./src/prisma/schema.prisma

FROM base AS development
CMD ["npm", "run", "start:dev"]

FROM base AS production
RUN npm run build
CMD ["npm", "start"]
