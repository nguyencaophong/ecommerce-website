const { EVENTS } = require('./common/constant/events.constant');
// interface IUserSocket {
//   userId: string;
//   socketsId: string[];
// }
//  example: users = [
//   {
//     userId: "1d7d787688v787e886e86d68",
//     socketsId: ["skhdj23jhjs", "23kjkksdfhksf"]
//   }
// ]
let users = [];

const addUser = (userId, socketId) => {
  users = users.filter((user) => user.userId !== null);
  users.forEach((user) => {
    if (user.userId === userId && !user.socketsId.includes(socketId)) {
      user.socketsId = [...user.socketsId, socketId];
    }
  });
  !users.some(
    (user) => user.userId === userId && user.socketsId.includes(socketId),
  ) && users.push({ userId, socketsId: [socketId] });
};

const removeUser = (socketId) => {
  // delete socket id from each item
  newUsers = users.map((user) => {
    const newSocketsId = user.socketsId.filter((item) => item !== socketId);
    return { ...user, socketsId: newSocketsId };
  });
  // filter out the users containing socket id
  users = newUsers.filter((user) => user.socketsId.length > 0);
};

const getSocketsUser = (users, receiverId) =>
  users.find((user) => user.userId === receiverId);

function socket({ io }) {
  console.log('Socket enabled');
  io.on(EVENTS.CONNECTION, (socket) => {
    console.log(`User connected ${socket.id}`);
    socket.on(EVENTS.CLIENT.ADD_USER, (userId) => {
      addUser(userId, socket.id);
      io.emit(EVENTS.SERVER.GET_USERS, users);
      console.log('add', users);
    });
    // server received message
    socket.on(EVENTS.CLIENT.SEND_MESSAGE, ({ message, receiverId }) => {
      console.log('users', users);
      console.log({ message, receiverId });
      const receiveUsers = getSocketsUser(users, receiverId);
      const senders = getSocketsUser(users, message.sender._id);
      console.log('receiveUsers', receiveUsers);
      console.log('sendersUser', senders);
      let listSocketIds = [];
      if (receiveUsers) {
        listSocketIds = [...listSocketIds, ...receiveUsers.socketsId];
      }
      if (senders) {
        listSocketIds = [...listSocketIds, ...senders.socketsId];
      }
      io.to(listSocketIds).emit(EVENTS.SERVER.GET_MESSAGE, {
        message,
        receiverId,
      });
    });

    // ** server received event typing
    // {
    //   isTyping: boolean;
    //   senderId: string;
    //   receiverId: string;
    //   conversationId: string;
    // }
    socket.on(
      EVENTS.CLIENT.TYPING,
      ({ isTyping, senderId, receiverId, conversationId }) => {
        console.log({ isTyping, senderId, receiverId, conversationId });
        const listSocketIdOfReceiver = getSocketsUser(users, receiverId);
        if (
          listSocketIdOfReceiver &&
          listSocketIdOfReceiver.socketsId.length > 0
        ) {
          io.to([...listSocketIdOfReceiver.socketsId]).emit(
            EVENTS.SERVER.LOADING,
            { isTyping, senderId, receiverId, conversationId },
          );
        }
      },
    );

    // ** Login
    socket.on(EVENTS.CLIENT.LOGIN, ({ userId }) => {
      console.log(`Nhận được thông tin login từ ${userId}`);
      io.emit(EVENTS.SERVER.GET_LOGIN, { userId });
    });

    // on log out
    socket.on(EVENTS.CLIENT.LOGOUT, ({ userId }) => {
      console.log(`Nhận được thông tin logout từ ${userId}`);
      // ** handle delete userid in users
      const indexUser = users.findIndex((user) => user.userId === userId);
      if (indexUser !== -1) {
        users[indexUser].userId = null;
        console.log(users);
      }
      io.emit(EVENTS.SERVER.GET_LOGOUT, { userId });
    });

    socket.on(EVENTS.DISCONNECT, (reason) => {
      console.log('disconnect: ', socket.id);
      console.log('reason', reason);
      console.log('users: ', users);
      removeUser(socket.id);
      console.log('new users: ', users);
      io.emit(EVENTS.SERVER.DISCONNECTED);
    });
  });
}
module.exports = socket;
