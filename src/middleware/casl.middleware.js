const UserModel = require('../models/user.model');
const permissions = require('../../configs/permissions.json');

const decentralization = async (req, res, next) => {
  let userDetail,roles = [];
  const payload = req.user;
  if (payload._id) {
    userDetail = await new UserModel(payload._id).read();
  }
  if (
    userDetail &&
    userDetail.roles[0] &&
    userDetail.roles[0].permissions.length > 0
  ) {
    for (let role of userDetail.roles) {
      const pers = [];
      for (let per of role.permissions) {
        const index = await permissions.findIndex((e) => e._id === per);
        if (index >= 0) {
          pers.push(permissions[index]);
        }
      }
      roles.push({ name: role.name, permissions: pers });
    }
    userDetail = { ...userDetail._doc, roles };
    req.user = userDetail;
  }
  next();
};

module.exports = {decentralization}