FROM node:15.13-alpine
WORKDIR /frapp

COPY . .
RUN npm ci
RUN npm run build