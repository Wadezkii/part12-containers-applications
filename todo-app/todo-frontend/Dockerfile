
FROM node:lts-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base as tester
COPY . .
RUN npm test

FROM base as builder
COPY . .
RUN npm run build

FROM nginx:stable-alpine as runner
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
