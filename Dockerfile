#syntax=docker/dockerfile:1
FROM node:22.15.0-alpine3.21
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
