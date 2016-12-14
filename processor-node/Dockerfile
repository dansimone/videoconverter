FROM node:4.4
EXPOSE 8080

ENV HTTP_PROXY=http://adc-proxy.oracle.com:80
ENV HTTPS_PROXY=http://adc-proxy.oracle.com:80
ENV http_proxy=http://adc-proxy.oracle.com:80

RUN npm install express
RUN npm install fluent-ffmpeg
RUN npm install stream-buffers
RUN npm install randomstring
RUN npm install tmp

RUN mkdir -p /ffmpeg/bin
COPY ffmpeg /ffmpeg/bin
COPY ffprobe /ffmpeg/bin
RUN chmod +x /ffmpeg/bin/*

ENV PATH=/ffmpeg/bin:${PATH}

COPY server.js .
CMD node server.js

