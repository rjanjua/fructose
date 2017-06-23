const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const enableDestroy = require('server-destroy');

function FructoseServer(port) {
  this.first = true;
  this.app = null;
  this.server = null;
  this.io = null;
  this.i = null;
  this.port = port;
}

FructoseServer.prototype.close = function () {
  this.server.destroy();
}

FructoseServer.prototype.start = function () {
  return new Promise ( (resolve, reject) => {
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);

    this.app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html');
    });

    this.io.on('connection',  (socket) => {
      if (this.first) {
        this.first = false;
      }

      socket.on('loadComponent', (componentName, props) => {
        this.io.emit('load-on-device', componentName, props);
      });

      socket.on('loadedOnDevice', () => {
        this.io.emit('loaded');
      });

      socket.on('debug', (r) => {
        console.log(r);
      });
    });

    this.server.listen(this.port, () => {
      enableDestroy(this.server);
      resolve();
    });
  });
}

module.exports = { FructoseServer }