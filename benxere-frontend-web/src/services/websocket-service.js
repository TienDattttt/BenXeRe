// src/services/websocket-service.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  _client = null;
  _connected = false;

  // --- FIX: return a TRUE unsubscribe function ---
  onMessage(callback) {
    if (!this._client || !this._connected) {
      console.warn("[WS] onMessage called before connect");
      return () => {}; // always return function
    }

    const defaultDestination = "/user/queue/messages";

    const sub = this._client.subscribe(defaultDestination, (message) => {
      let payload = message.body;
      try { payload = JSON.parse(message.body); } catch {}
      callback && callback(payload, message);
    });

    // ✔ FIX: wrap unsubscribe into function
    return () => {
      try {
        sub.unsubscribe();
      } catch (e) {}
    };
  }

  async connect({
    url = import.meta?.env?.VITE_WS_URL || process.env.REACT_APP_WS_URL || '/ws',
    token,
    onConnect,
    onError,
    debug = false,
    heartbeatIncoming = 10000,
    heartbeatOutgoing = 10000,
  } = {}) {
    if (this._client && this._connected) return true;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return new Promise((resolve, reject) => {
      const client = new Client({
        webSocketFactory: () => new SockJS(url),
        connectHeaders: headers,
        debug: debug ? (str) => console.log('[STOMP]', str) : () => {},
        reconnectDelay: 3000,
        heartbeatIncoming,
        heartbeatOutgoing,

        onConnect: (frame) => {
          this._connected = true;
          onConnect && onConnect(frame);
          resolve(true);
        },
        onStompError: (frame) => {
          console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
          onError && onError(frame);
          reject(frame);
        },
        onWebSocketError: (evt) => {
          console.error('[WS ERROR]', evt);
          onError && onError(evt);
          reject(evt);
        },
      });

      this._client = client;
      client.activate();
    });
  }

  // --- FIX: subscribe returns unsubscribe function ---
  subscribe(destination, callback, headers = {}) {
    if (!this._client || !this._connected) {
      console.warn('[WS] subscribe before connected');
      return () => {};
    }

    const sub = this._client.subscribe(destination, (message) => {
      let payload = message.body;
      try { payload = JSON.parse(message.body); } catch {}
      callback && callback(payload, message);
    }, headers);

    return () => {
      try {
        sub.unsubscribe();
      } catch (e) {}
    };
  }

  send(destination, body = {}, headers = {}) {
    if (!this._client || !this._connected) {
      console.warn('[WS] send before connected');
      return;
    }
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    this._client.publish({ destination, body: payload, headers });
  }

  isConnected() {
    return !!(this._client && this._connected);
  }

  disconnect() {
    return new Promise((resolve) => {
      if (!this._client) return resolve();
      this._client.deactivate().then(() => {
        this._client = null;
        this._connected = false;
        resolve();
      });
    });
  }
}

const instance = new WebSocketService();
export default instance;
export { WebSocketService, instance as websocketService };
