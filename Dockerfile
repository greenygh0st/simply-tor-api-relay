### STAGE 1: Build ###
FROM node:14.3-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json run.sh ./
COPY torrc /etc/tor/torrc
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM node:14.3-alpine

# tor setup
RUN apk update && apk add tor
RUN chown -R tor /etc/tor
USER tor

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist .

EXPOSE 8080

# run run.sh
CMD ["sh", "run.sh"]
