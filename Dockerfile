FROM node:8.9.1

WORKDIR /usr/src/app
ADD package.json /usr/src/app
ADD .npmrc /usr/src/app
RUN npm install

RUN mkdir -p /usr/src/app
ADD . /usr/src/app
RUN npm run build
RUN npm run build-server

CMD ["npm", "run", "start-server"]