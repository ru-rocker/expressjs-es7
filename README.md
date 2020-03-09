# NodeJS + ES Sample Application
REST API example: **ExpressJS** connects to ElasticSearch

# ExpressJS
Generate project:


      express --no-view es-sample


### ES library
ES library for NodeJS.


       npm install @elastic/elasticsearch --save


### Security Header and Compression
Library for HTTP security header and compression


       npm install helmet compression --save


### Environment Configurations
Configuration properties


       npm install dotenv --save


### Utility libs
Utility libs

       npm install lodash --save

# app.js

### Setup security header, compression and configuration properties


      app.use(cookieParser());
      app.use(compression());
      app.use(helmet());

      // environment configurations
      const dotenv = require('dotenv')
      dotenv.config({ path: `config/.env.${process.env.NODE_ENV}` })


### Setup ES
Basically, you don't need **ssl** part, unless you used self-signed certificate.

      // ES client configuration
      const client = new Client({
        node: process.env.ES_HOST,
        auth: {
          apiKey: process.env.API_KEY
        },
        ssl: {
          ca: [fs.readFileSync(process.env.CA_CERT)], // to read CA certificate
          rejectUnauthorized: true
        }
      });

      app.set('client', client);

_NOTE:_ API Key should be in Base64, with combination with ID and api_key from host.
How to create API KEY, see [here](https://www.elastic.co/guide/en/elasticsearch/reference/master/security-api-create-api-key.html)

# Search URL

      // search by title
      http://localhost:3000/books/title?keyword=yourkeyword

      // search by category
      http://localhost:3000/books/category?keyword=yourkeyword

      // search by author
      http://localhost:3000/books/author?keyword=yourkeyword



# RUN ES on Docker


      docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.6.1


Then import data to ES


       curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/books/_bulk?pretty' --data-binary @sample-data/sample.ndjson


# Testing
Testing needs


      npm install chai chai-http nyc mocha --save-dev


### package.json
Add two command for running test under script body.


      "scripts": {
        "start": "node ./bin/www",
        "test": "mocha 'test/**/*.js' --timeout 10000 ",
        "coverage": "nyc npm test"    
      }

### Execute Test


     npm test
     npm run coverage
