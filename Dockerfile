FROM node:15.8.0

WORKDIR /server

COPY . /server
RUN npm install -g npm@7.17.0
RUN npm install

VOLUME /demo_model_mms_helper_shared_volume
EXPOSE 3000
CMD [ "npm", "start" ]
