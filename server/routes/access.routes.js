import express from 'express';
import multer from 'multer';
import fs from 'fs';
import uuidv4 from 'uuid/v4'; 
import validator from 'validator';
import { getUserByEmail } from '../utils/userUtils';

const parse = require('url-parse');
const md5 = require('md5');
const bcrypt = require('bcrypt-nodejs');
const router = new express.Router();
const { sendMail } = require('../utils/sendmail');
const { getUsers, getUser, getUserByToken, saveUser, doesUserExist, createUser, countUsers,
        deleteUser, initUsersConfig, updateUserConfig, logActivity, getActivityLog } = require('../utils/userUtils');
const { getMapCountForUser, deleteMap } = require('../utils/designUtils');
const { getJobCountForUser } = require('../utils/jobUtils');


router.get('/', function(req, res, next) {
  return res.end("ACCESS API Index");
});

router.get('/help', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.redirect('http://localhost:10500/faq/index.html');
});

router.get('/users', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});
  var users = getUsers();
  users.map((user) => {
    var maps = getMapCountForUser(user);
    user.ownedMaps = maps.owned;
    user.sharedMaps = maps.shared;
    user.countJobs = getJobCountForUser(user);    
  })

  return res.json({success: true, users: users});      
});

router.post('/deleteuser', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Delete user - ' + req.body.email});
  var users = deleteUser(req.body.email);    
  return res.json({success: true, users: users});      
});

router.get('/activate', function(req, res, next) {
  var token = req.query.token;

  var user = getUserByToken(token);
  if (!user)
    return res.json({success: false, message: 'Unknown user, please register and try again'});
    
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Activate user'});
  if (user.status === 'UNVERIFIED') {
    user.status = 'VERIFIED';
    saveUser(user);
  }

  return res.json({success: true, token: user.token});
});

router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  if (!email || !validator.isEmail(email))
    return res.json({success: false, message: 'Invalid email specified'});
  
  var user = getUser(email);
  if (!user)
    return res.json({success: false, message: 'Unknown user, please register and try again'});
    
  if (user.status === 'UNVERIFIED')
    return res.json({success: false, message: 'Verfy email id and try again'});
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'User logged in'});
  return bcrypt.compare(password, user.password, function(err, isMatch) {
    if (err) 
      return res.json({success: false, message: 'Unknown user, login failed'});

    if (isMatch) {
      user.lastLoginAt = new Date().toLocaleString();
      saveUser(user);

      return res.json({success: true, name: user.name, email: user.email, token: user.token, 
                      admin: Object.keys(user).indexOf('admin') >= 0 ? user.admin : false});
    } 

    return res.json({success: false, message: 'Invalid password, login failed'});    
  });      
});

router.get('/getuser', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var token = req.query.user;

  var user = getUserByToken(token);
  if (!user)
    return res.json({success: false, message: 'Unknown user, please register and try again'});
    

  return res.json({success: true, user: { name: user.name, email: user.email, token: user.token, 
                  admin: Object.keys(user).indexOf('admin') >= 0 ? user.admin : false}});
});

router.post('/signup', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  if (!email || !validator.isEmail(email))
    return res.json({success: false, message: 'Invalid email specified'});
  
  var user = doesUserExist(email);
  if (user)
    return res.json({success: false, message: 'A user already registered with specified email id'});
  
  return bcrypt.genSalt(10, function(err, salt) {
    if (err)
      return res.json({success: false, message: 'User signup failed'});
    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err)
        return res.json({success: false, message: 'User signup failed'});

      var user = createUser(name, email);
      user.password = hash;
      user.token = md5(uuidv4());
      user.admin = countUsers() ? false : true;
      saveUser(user);

      var parts = parse(req.headers.referer);

      var subject = 'Universal Data Mapper - Signup Verification';
      var body = 'Hi <b>' + user.name + '</b>,<br><br>';
      body += 'Please verify your registration by clicking on the following link:<br><br>';
      body += '<a href="http://' + parts.hostname + ':' + parts.port + '/activate?token=' + user.token + '">Activate</a>';
      body += '<br><br>Thank you.';
      
      sendMail(user, subject, body, 'account ctivation')
        .then(function(result) {
          if (result.status) {
            logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'New user signup'});
            return res.json({success: true, message: 'Signup successful, check email and activate the account', token: user.token}); 
          }

          return res.json({success: true, message: result.message});
        });      
    })
  })
});

router.get('/activitylog', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});
  var entries = getActivityLog();

  return res.json({success: true, entries: entries});      
});

router.post('/toggleadmin', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user || (!user.admin && user.email !== 'xxx@yyy'))
    return res.json({success: false, message: 'Unauthorized request'});

  var _user = getUserByEmail(req.body.email);
  _user.admin = Object.keys(_user).indexOf('admin') >= 0 ? !_user.admin : false;

  saveUser(_user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Toggle admin (' + _user.email + ') - ' + (_user.admin ? 'GRANTED' : 'REMOVED')});
  
  return res.json({success: true, message: 'Successfully toggled admin'});      
});

module.exports = router;
