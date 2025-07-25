FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY ./src/server.js .
COPY xato-net-10-million-passwords-1000.txt .

USER node

EXPOSE 80
CMD ["npm", "start"]