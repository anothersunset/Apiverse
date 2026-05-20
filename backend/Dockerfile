FROM node:20-alpine

WORKDIR /app

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG http_proxy
ARG https_proxy
ENV HTTP_PROXY=$HTTP_PROXY HTTPS_PROXY=$HTTPS_PROXY http_proxy=$http_proxy https_proxy=$https_proxy

COPY package*.json ./
RUN npm ci --only=production --registry https://registry.npmmirror.com

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
