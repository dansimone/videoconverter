FROM node:7.2.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle ffmpeg
RUN mkdir -p /ffmpeg/bin
COPY ffmpeg /ffmpeg/bin
COPY ffprobe /ffmpeg/bin
RUN chmod +x /ffmpeg/bin/*

ENV PATH=/ffmpeg/bin:${PATH}

# Bundle app source
COPY server.js /usr/src/app

EXPOSE 8080
CMD node server.js