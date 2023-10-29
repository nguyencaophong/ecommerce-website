const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CLIENT: {
    ADD_USER: 'add_user',
    SEND_MESSAGE: 'send_message',
    TYPING: 'typing',
    BLUR: 'blur',
    LOGOUT: 'logout',
    LOGIN: 'login',
  },
  SERVER: {
    GET_USERS: 'get_users',
    GET_MESSAGE: 'get_message',
    GET_LOGOUT: 'get_logout',
    GET_LOGIN: 'get_login',
    LOADING: 'loading',
    DISCONNECTED: 'disconnected',
  },
};
module.exports = { EVENTS };
