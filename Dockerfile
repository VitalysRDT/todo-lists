FROM node:23.1.0

WORKDIR /app

COPY package.json .

RUN npm install
RUN npm install -g typescript

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]