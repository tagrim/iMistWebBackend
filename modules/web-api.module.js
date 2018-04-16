const websocketServer = require('websocket').server;
const http = require('http');

import { DEBUG, WEBAPI_PORT } from '../config/constants.config';
import WebApiService from '../services/web-api.service';

class WebApi {
  constructor() {
    this.connection = undefined;
    WebApiService.init();
  }

  /**
   * Listen WebSocket requests
   */
  listen() {
    this.server = http.createServer((request, response) => {
      response.writeHead(404);
      response.end();
    });
    this.server.listen(WEBAPI_PORT, () => {});
    this.wsServer = new websocketServer({
      httpServer: this.server,
      autoAcceptConnections: true
    });
    this.wsServer.on('request', this.handleConnectionRequest);

    DEBUG && console.log('☺︎ WebApi is listening on port 8080'.yellow);
  }

  /**
   * Parse websocket payload
   *
   * @param request
   */
  handleConnectionRequest(request) {
    this.connection = request.accept('echo-protocol', request.origin);
    this.connection.on('message', this.handleMessage);
  }

  /**
   * Handle api request message
   * @param message
   */
  handleMessage(message) {
    const { action, payload } = message.utf8Data.split(';');
    WebApiService.handleRequest(action, payload);
  }
}

export default new WebApi();
