process.env.NODE_ENV = 'test';

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
chai.should();
chai.use(chaiHttp);

describe.only('Retrieve data from ES', () => {
  before('Populate ES Data', (done) => {
    const client = server.get('client')
    const body = fs.readFileSync('sample-data/sample.ndjson')
    client.bulk({
      index: process.env.ES_CONTRACT_INDEX,
      body: body
    }).then((res) => {
      console.log('succeess!')
      setTimeout(function () {
        done()
      }, 1000)
    }, (error) => {
      console.trace(error)
      done()
    })
  })
  it('GET search title', done => {
    chai.request(server)
        .get('/books/title')
        .query({'keyword': 'cracking'})
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(1)
          done()
        })
  })
  it('GET search title with empty params', done => {
    chai.request(server)
        .get('/books/title')
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(3)
          done()
        })
  })
  it('GET search title with illegal characters. It should return 500', done => {
    chai.request(server)
      .get('/books/title')
      .query({'keyword': 'sapiens:'})
      .set('content-type', 'application/json')
      .end((_, res) => {
        res.should.have.status(500)
        done()
      })
  })
  it('GET search category', done => {
    chai.request(server)
        .get('/books/category')
        .query({'keyword': 'computer'})
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(1)
          done()
        })
  })
  it('GET search category with empty params', done => {
    chai.request(server)
        .get('/books/category')
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(3)
          done()
        })
  })
  it('GET search category with illegal characters. It should return 500', done => {
    chai.request(server)
      .get('/books/category')
      .query({'keyword': 'comp:'})
      .set('content-type', 'application/json')
      .end((_, res) => {
        res.should.have.status(500)
        done()
      })
  })
  it('GET search author', done => {
    chai.request(server)
        .get('/books/author')
        .query({'keyword': 'noah'})
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(2)
          done()
        })
  })
  it('GET search author with empty params', done => {
    chai.request(server)
        .get('/books/author')
        .set('content-type', 'application/json')
        .end((_, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('total').property('relation').eql('eq')
          res.body.should.have.property('total').property('value').eql(3)
          done()
        })
  })
  it('GET search author with illegal characters. It should return 500', done => {
    chai.request(server)
      .get('/books/author')
      .query({'keyword': 'andy:'})
      .set('content-type', 'application/json')
      .end((_, res) => {
        res.should.have.status(500)
        done()
      })
  })
  it('GET /books/notfound. It should return not found', done => {
    chai.request(server)
      .get('/books/notfound')
      .set('content-type', 'application/json')
      .end((_, res) => {
        res.should.have.status(404)
        done()
      })
  })
});
