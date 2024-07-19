FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:css

EXPOSE 8010

CMD [ "npm", "start" ]
