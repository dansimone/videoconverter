FROM node:4.4
EXPOSE 8080

ENV HTTP_PROXY=http://adc-proxy.oracle.com:80
ENV HTTPS_PROXY=http://adc-proxy.oracle.com:80
ENV http_proxy=http://adc-proxy.oracle.com:80

RUN npm install express
RUN npm install mysql
RUN npm install randomstring
RUN npm install tmp
RUN npm install http


COPY server.js .
CMD node server.js
