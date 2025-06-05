# pull base image
FROM node:20-alpine

# set working directory
WORKDIR /app

# default to port 19006 for node, and 19001 and 19002 (tests) for debug
ARG PORT=19006
ENV PORT $PORT
EXPOSE $PORT 19001 19002 8081

# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
COPY ./package.json ./package-lock.json ./
RUN npm ci

# for development, we bind mount volumes; comment out for production
COPY . .

ENTRYPOINT ["npm", "run"]
CMD ["start", "--host", "0.0.0.0"]