const RoleSchema = require("../schemas/role.schema");
const History = require("../models/history.model");
const ability = require("../casl/casl.factory");
const { ForbiddenError } = require("@casl/ability");
const Action = require("./action.enum");

module.exports = class User {
  id;
  #name;
  #permissions;

  constructor(id, name, permissions = []) {
    this.id = id;
    this.#name = name;
    this.#permissions = permissions;
  }

  create = (req) =>
    new Promise((resolve, reject) => {
      RoleSchema.findById(this.id).then(async (role) => {
        try {
          if (this.id && !role) {
            return reject({ status: 404, message: "Role not found!" });
          }
          role = role || new RoleSchema();
          role.name = this.#name;
          role.permissions = this.#permissions;
          ForbiddenError.from(ability(req.user)).throwUnlessCan(
            Action.Create,
            role
          );
          role.save();
          await new History(
            undefined,
            req.user._id,
            new Date(),
            `Thêm role (${role.name}) ở mục Roles`
          ).create();
          resolve(role);
        } catch (err) {
          reject(err);
        }
      });
    });

  update = (req) =>
    new Promise((resolve, reject) => {
      RoleSchema.findById(this.id).then(async (role) => {
        try {
          if (this.id && !role) {
            return reject({ status: 404, message: "Role not found!" });
          }
          role = role || new RoleSchema();
          role.name = this.#name;
          role.permissions = this.#permissions;
          ForbiddenError.from(ability(req.user)).throwUnlessCan(
            Action.Update,
            role
          );
          role.save();
          await new History(
            undefined,
            req.user._id,
            new Date(),
            `Cập nhật role (${role.name}) ở mục Roles`
          ).create();
          resolve(role);
        } catch (err) {
          reject(err);
        }
      });
    });

  read = (req) =>
    new Promise((resolve, reject) => {
      RoleSchema.findOne({
        $or: [{ _id: this.id }, { name: this.#name }],
      }).then((role) =>
        role
          ? resolve(role)
          : reject({ status: 404, message: "Role not found!" })
      );
    });

  list = (req) =>
    new Promise((resolve, reject) => {
      RoleSchema.accessibleBy(ability(req.user))
        .find()
        .then((roles) => resolve(roles))
        .catch((err) => reject(err));
    });

  delete = (req) =>
    new Promise((resolve, reject) => {
      RoleSchema.findById(this.id)
        .then(async (role) => {
          try {
            if (!role) reject({ status: 404, message: "Role not found!" });

            ForbiddenError.from(ability(req.user)).throwUnlessCan(
              "delete",
              role
            );
            await role.remove();

            await new History(
              undefined,
              req.user._id,
              new Date(),
              `Xóa role (${role.name}) ở mục Roles`
            ).create();
            resolve(role);
          } catch (err) {
            reject(err);
          }
        })
        .catch((err) => reject(err));
    });
};
