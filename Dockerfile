FROM node:12

ARG PROJ_WORKDIR=/opt/
ARG PORT=3000
ENV PORT ${PORT}

WORKDIR ${PROJ_WORKDIR}

# Install dependencies first, add code later: docker is caching by layers
COPY .npmrc .npmrc
COPY package.json package.json

# Docker base image is already NODE_ENV=production
RUN npm install --only=prod

# Add your source files
COPY . .

RUN rm -f .npmrc && \
    groupadd -r node && useradd -r -g node node && \
    chown -R node:node .

USER node

# Silent start because we want to have our log format as the first log
CMD ["npm", "start"]
