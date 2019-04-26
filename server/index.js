import 'babel-register';
import 'babel-polyfill';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import expressGraphQL from 'express-graphql';
import bodyParser from 'body-parser';

process.env.BASEDIR = __dirname;
process.env.FILESDIR = __dirname + '/../files';
console.log('FILESDIR: ' + process.env.FILESDIR)
if (!fs.existsSync(process.env.FILESDIR))
  fs.mkdirSync(process.env.FILESDIR);

if (!fs.existsSync(process.env.FILESDIR + '/maps'))
  fs.mkdirSync(process.env.FILESDIR + '/maps');
if (!fs.existsSync(process.env.FILESDIR + '/jobs'))
  fs.mkdirSync(process.env.FILESDIR + '/jobs');


console.log("PROCESS ID: " + process.pid);

const MONGO_CONFIG = {
  useMongoClient: true,
  reconnectInterval: 2000,
  reconnectTries: Infinity,
};

const app = express();

//form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var access = require('./routes/access.routes');
app.use('/api/access', access);
var mapper = require('./routes/mapper.routes');
app.use('/api/mapper', mapper);
var jobs = require('./routes/jobs.routes');
app.use('/api/jobs', jobs);

app.use('/faq', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.url !== '/index.html') {
    return res.sendFile((path.join(__dirname, '../faq', req.url)));
  }
  return res.sendFile((path.join(__dirname, '../faq/', 'index.html')));
});

app.get('/*', (req, res) => {
  if (path.extname(req.url).length > 0) {
    return res.sendFile((path.join(__dirname, '../build', req.url)));
  }
  return res.sendFile((path.join(__dirname, '../build', 'index.html')));
});

app.use((req, res, next) => {
  const err = new Error(`Not Found: ${req.url}`);
  err.status = 404;
  next(err);
});


app.listen(process.env.APP_PORT || 10500, () => {
  console.log(`App is running on ${process.env.APP_PORT || 10500}`);
});
