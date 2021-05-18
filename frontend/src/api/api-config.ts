const API_DEV_CONFIG = {
  SECURE: false,
  HOST: 'localhost:8080',
  PATH: '/_api/v1',
};

const API_AUTO_CONFIG = {
  SECURE: window.location.protocol.startsWith('https'),
  HOST: window.location.host,
  PATH: '/_api/v1',
};

// determine api config dynamically
const API = window.location.host === 'localhost:3000' ? API_DEV_CONFIG : API_AUTO_CONFIG;

const API_URL = `${API.SECURE ? 'https' : 'http'}://${API.HOST}${API.PATH}`;
const AUTH_URL = `${API_URL}/auth`;
const WS_URL = `${API.SECURE ? 'wss' : 'ws'}://${API.HOST}${API.PATH}/ws`;

export const API_URLS = {
  API: API_URL,
  AUTH: AUTH_URL,
  WS: WS_URL,
};
