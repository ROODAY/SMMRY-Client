# set node image with version
FROM node:12.16.1-alpine
EXPOSE 8080

# create directory
RUN mkdir /application

# set work directory
WORKDIR /application

# copy all sources to container
COPY . /application

# install dependencies
RUN npm install -g pm2
RUN yarn install
RUN yarn build

# run application directly with pm2
CMD pm2 start server.js --no-daemon
