FROM node:16-alpine

WORKDIR /usr/app/ambyint

COPY package.json package.json
COPY yarn.lock yarn.lock

COPY . .

CMD ["yarn", "start"]