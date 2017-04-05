'use strict';
var express = require('express');
var path = require('path');
var app = express();
var device = require('express-device');
var date = require('date-and-time');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'kervingames',
  multipleStatements: true
});

app.use(session({
  cookieName: 'session',
  secret: 'QWLHI4ZEsMpee63pUpbBea9IvsaE6BWHPY2L5XDvQYg6kiDRaNp9eKIeXA9HKC2OYiyaHs',
  duration: 30 * 60 * 100,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true
}));

conn.connect(function(err){
  if(err){
    console.error('Error when connecting to database: ', err);
    setTimeout(conn.connect(), 2000);
  }
});

conn.on('error', function(err){
  console.error('database error: ', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST'){
    conn.connect();
  }else{
    throw err;
  }
});


var getUsernameData = [];
function setUsernameData(value, counter){
  value = value.toUpperCase();
  getUsernameData[counter] = value;
}

var getEmailData = [];
function setEmailData(value, counter){
  value = value.toUpperCase();
  getEmailData[counter] = value;
}

setInterval(function(){
  conn.query('SELECT username FROM accounts', function(err, rows){
    if(err){
      console.error(err);
    }else{
      var string = JSON.stringify(rows);
      var json = JSON.parse(string);
      for(var i = 0;i<rows.length;i++){
        setUsernameData(json[i].username, i);
      }
    }
  });

  conn.query('SELECT email FROM accounts', function(err, rows){
    if(err){
      console.error(err);
    }else{
      var string = JSON.stringify(rows);
      var json = JSON.parse(string);
      for(var i = 0;i<rows.length;i++){
        setEmailData(json[i].email, i);
      }
    }
  });
},1);

app.use(device.capture());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/static', express.static('app'));

app.get('/', (req, res) => {
  if(typeof req.session.clientUsername === 'undefined'){
    if(req.device.type === 'phone'){
      res.sendFile(__dirname + '/app/mobile/index.html');
    }else if(req.device.type === 'desktop'){
      res.sendFile(__dirname + '/app/desktop/index.html');
    }else{
      res.sendFile(__dirname + '/app/tablet/index.html');
    }
  }else{
    if(req.device.type === 'phone'){
      res.sendFile(__dirname + '/app/mobile/indexLogged.html');
    }else if(req.device.type === 'desktop'){
      res.sendFile(__dirname + '/app/desktop/indexLogged.html');
    }else{
      res.sendFile(__dirname + '/app/tablet/indexLogged.html');
    }
  }
});

app.post('/getAccountPage', (req, res) => {
  var clientUsername = req.body.value;
  res.redirect('/'+clientUsername+'/account');
});

app.get('/*/account', (req, res) => {
  if(typeof req.session.clientUsername !== 'undefined'){
    if(req.device.type === 'phone'){
      res.sendFile(__dirname + '/app/mobile/etc/account.html');
    }else if(req.device.type === 'desktop'){
      res.sendFile(__dirname + '/app/mobile/etc/account.html');
    }else{
      res.sendFile(__dirname + '/app/mobile/etc/account.html');
    }
  }else{
    res.redirect('/');
  }
});

app.post('/getPaymentsPage', (req, res) => {
  res.redirect('/'+req.session.clientUsername+'/payments');
});

app.get('/*/payments', (req, res) => {
  if(typeof req.session.clientUsername !== 'undefined'){
    if(req.device.type === 'phone'){
      res.sendFile(__dirname + '/app/mobile/etc/payments.html');
    }else if(req.device.type === 'desktop'){
      res.sendFile(__dirname + '/app/mobile/etc/payments.html');
    }else{
      res.sendFile(__dirname + '/app/mobile/etc/payments.html');
    }
  }else{
    res.redirect('/');
  }
});

app.put('/getUsernameAvailable', (req, res) => {
  if(getUsernameData.indexOf(req.body.username.toUpperCase()) > -1){
    res.send('exists');
  }else{
    res.send('dne');
  }
});

app.put('/getEmailAvailable', (req, res) => {
  if(getEmailData.indexOf(req.body.email.toUpperCase()) > -1){
    res.send('exists');
  }else{
    res.send('dne');
  }
});

app.post('/createAccount', (req, res) => {
  if(getUsernameData.indexOf(req.body.username.toUpperCase()) > -1){
    res.send('username is taken.');
  }else{
    var account = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    };
    conn.query('INSERT INTO accounts SET ?', account, (err, response) => {
      if(err){
        throw err;
      }else{
        req.session.clientUsername = req.body.username;
        req.session.clientPassword = req.body.password;
        req.session.clientEmail = req.body.email;
        console.log('New account. Username: '+req.session.clientUsername+'');
        res.send('true');
      }
    });
  }
});

app.post('/loginAttempt', (req, res) => {
  var userEmail = req.body.userEmail;
  var password = req.body.password;
  var sql = 'SELECT DISTINCT username, password, email from accounts WHERE username='+'"'+userEmail+'"'+' and password='+'"'+password+'"'+'';
  conn.query(sql, (err, rows) => {
    if(err){
      throw err;
    }else{
      for(var i = 0;i<rows.length;i++){
        var row = rows[i];
        req.session.clientUsername = row.username;
        req.session.clientPassword = row.password;
        req.session.clientEmail = row.email;
        console.log('Login attempt @ '+req.session.clientUsername+'...');
      }
    }
  });
  if(typeof req.session.clientUsername === 'undefined'){
    var sqlEmail = 'SELECT DISTINCT username, password, email from accounts WHERE email='+'"'+userEmail+'"'+' and password='+'"'+password+'"'+'';
    conn.query(sqlEmail, (err, rows) => {
      if(err){
        throw err;
      }else{
        for(var i = 0;i<rows.length;i++){
          var row = rows[i];
          req.session.clientUsername = row.username;
          req.session.clientPassword = row.password;
          req.session.clientEmail = row.email;
          console.log('Login attempt @ '+req.session.clientUsername+'...');
        }
        if(typeof req.session.clientUsername === 'undefined'){
          res.send('dne');
        }else{
          res.send('exists');
        }
      }
    });
  }else{
    res.send('exists');
  }
});

app.post('/getClientUsername', (req, res) => {
  if(req.session.clientUsername !== null){
    res.send(req.session.clientUsername);
  }else{
    res.send('nothing here');
  }
});

app.post('/getClientPassword', (req, res) => {
  if(req.session.clientPassword !== null){
    res.send(req.session.clientPassword);
  }else{
    res.send('nothing here');
  }
});

app.post('/getClientEmail', (req, res) => {
  if(req.session.clientEmail !== null){
    res.send(req.session.clientEmail);
  }else{
    res.send('nothing here');
  }
});

app.post('/logoutAttempt', (req, res) => {
  req.session.reset();
  res.send('redirect');
});

//Sends date to client for website access date
app.get('/getDate', (req, res) => {
  res.send(date.format(new Date(), 'YYYY'));
});

app.listen(80, () => {
  console.log('Server is listening at kervingames.com');
});
