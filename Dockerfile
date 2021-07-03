FROM node:16.3.0

RUN apt update -y && apt install ffmpeg -y

WORKDIR /server

COPY . /server
RUN npm install -g npm
RUN npm install

VOLUME /demo_model_mms_helper_shared_volume
EXPOSE 3000
CMD [ "npm", "start" ]
