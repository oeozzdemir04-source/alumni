FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src

EXPOSE 3000

# nodemon (polling) restarts the server when files in ./src change (mounted by docker-compose)
CMD ["npx", "nodemon", "-L", "--watch", "src", "--ext", "js,ejs,json", "src/server.js"]
