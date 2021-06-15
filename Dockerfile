FROM node:15.8.0

WORKDIR /server

COPY . /server
RUN npm install -g npm@7.17.0
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
