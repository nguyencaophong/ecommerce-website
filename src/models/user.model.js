const Error = require('../utils/app_error.util.js');
const bcrypt = require('bcryptjs');
const UserSchema = require('../schemas/user.schema');
const History = require('../models/history.model');
const { ForbiddenError } = require('@casl/ability');
const ability = require('../casl/casl.factory.js');
const Action = require('./action.enum.js');
const { isEmail } = require('../utils/checker.util.js');
const EmailModel = require('../models/email.model.js');
const PhoneModel = require('../models/phone.model.js');
module.exports = class User {
  id;
  #avatar;
  #full_name;
  #username;
  #phone;
  #email;
  #password;
  #blocked;
  #roles;
  #sex;
  #address;
  #birthday;

  constructor(
    id,
    avatar,
    full_name,
    email,
    phone,
    username,
    password,
    blocked = false,
    roles = [],
    sex,
    address,
    birthday,
  ) {
    this.id = id;
    this.#avatar = avatar;
    this.#full_name = full_name;
    this.#email = email;
    this.#phone = phone;
    this.#username = username;
    this.#password = password;
    this.#blocked = blocked;
    this.#roles = roles;
    this.#sex = sex;
    this.#address = address;
    this.#birthday = birthday;
  }

  create = (req) =>
    new Promise(async (resolve, reject) => {
      if (!this.#password)
        return reject(new Error('Password is required!', 400));
      if (this.#email && (await UserSchema.findOne({ email: this.#email })))
        return reject(new Error('Email address is taken!', 422));
      if (this.#phone && (await UserSchema.findOne({ phone: this.#phone })))
        return reject(new Error('Phone number is taken!', 422));
      if (
        this.#username &&
        (await UserSchema.findOne({ username: this.#username }))
      )
        return reject(new Error('Username is taken!', 422));

      // ** verify code
      try {
        isEmail(
          this.#username
            ? await new EmailModel(undefined, this.#username).verify(req)
            : await new PhoneModel(undefined, this.#username).verify(req),
        );
      } catch (err) {
        return reject(new Error(err.message, 422));
      }

      const user = new UserSchema();
      user.full_name = this.#full_name;
      user.email = this.#email;
      user.phone = this.#phone;
      user.username = this.#username;
      user.password = bcrypt.hashSync(this.#password, bcrypt.genSaltSync(10));
      user.sex = this.#sex;
      user.address = this.#address;
      user.birthday = this.#birthday;
      user
        .save()
        .then((user) => resolve(user))
        .catch(reject);
    });

  list = (req) =>
    new Promise((resolve, reject) => {
      UserSchema.accessibleBy(ability(req.user))
        .find()
        .populate('')
        .then((users) => resolve(users))
        .catch((err) => reject(err));
    });

  read = () =>
    new Promise((resolve, reject) =>
      UserSchema.findById(this.id)
        .populate('roles')
        .then((user) =>
          user ? resolve(user) : reject(new Error('User not found!', 404)),
        )
        .catch(reject),
    );

  update = (req) =>
    new Promise(async (resolve, reject) => {
      const user = await UserSchema.findById(this.id);
      if (!user) {
        return reject(new Error('User not found!', 400));
      }
      const isUniqUsername = await UserSchema.findOne({
        $and: [
          { username: this.#username },
          { username: { $ne: null } },
          { _id: { $ne: user._id } },
        ],
      });
      if (isUniqUsername) {
        return reject(new Error('Username is taken!', 422));
      }
      this.#avatar && (user.avatar = this.#avatar);
      user.full_name = this.#full_name;
      user.avatar = this.#avatar ? this.#avatar : user.avatar;
      user.sex = this.#sex;
      user.address = this.#address;
      user.username = this.#username;
      user.birthday = this.#birthday;

      await user.save();

      await new History(
        undefined,
        req.user._id,
        new Date(),
        `Cập nhật tài khoản ${user.full_name.first} ${user.full_name.last}`,
      ).create();
      resolve(user);
    });

  delete = (req) =>
    new Promise((resolve, reject) => {
      UserSchema.findById(this.id).then(async (user) => {
        try {
          if (!user) reject(new Error('User not found!', 404));
          ForbiddenError.from(ability(req.user)).throwUnlessCan(
            Action.Delete,
            user,
          );
          await user.remove();
          console.log(user);
          await new History(
            undefined,
            req.user._id,
            new Date(),
            `Xóa tài khoản ${user.full_name.first} ${user.full_name.last}`,
          ).create();
          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    });

  updateRole = () =>
    new Promise((resolve, reject) => {
      UserSchema.findById(this.id).then(async (user) => {
        try {
          if (!user) {
            reject(new Error('User not found!', 404));
          }

          user.roles = this.#roles;
          await user.save();

          await new History(
            undefined,
            user._id,
            new Date(),
            `Cập nhật role của ${user.full_name.first} ${user.full_name.last}`,
          ).create();

          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    });

  block = (req) =>
    new Promise((resolve, reject) => {
      UserSchema.findById(this.id).then(async (user) => {
        try {
          if (!user) reject(new Error('User not found!', 404));

          user.block.blocked = !user.block.blocked;
          ForbiddenError.from(ability(req.user)).throwUnlessCan(Action.Update, {
            action: 'update-user',
          });
          await user.save();

          await new History(
            undefined,
            req.user._id,
            new Date(),
            `${
              user.block.blocked
                ? 'Vô hiệu hóa tài khoản'
                : 'Khôi phục tài khoản'
            } ${user.full_name.first} ${''} ${user.full_name.last}`,
          ).create();
          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    });

  changePassword = (new_pass) =>
    new Promise(async (resolve, reject) => {
      const user = await UserSchema.findOne({
        [this.id ? '_id' : this.#email ? 'email' : this.#phone ? 'phone' : '']:
          this.id || this.#email || this.#phone,
      });
      if (!user) {
        return reject(new Error('User not found!', 404));
      }
      if (this.id && !user.authenticate(this.#password)) {
        return reject(new Error('Wrong password!', 401));
      }
      if (this.id && new_pass === this.#password) {
        return reject(
          new Error(
            'The new password must be different from the password!',
            400,
          ),
        );
      }

      const hashedPass = await bcrypt.hash(new_pass, bcrypt.genSaltSync(10));
      const updatedPassword = await UserSchema.findByIdAndUpdate(
        user._id,
        {
          $set: { password: hashedPass },
        },
        { new: true },
      );
      resolve(updatedPassword);
    });

  changeEmail = () =>
    new Promise((resolve, reject) =>
      UserSchema.findByIdAndUpdate(
        this.id,
        { $set: { email: this.#email } },
        { new: true },
      )
        .then((user) =>
          user ? resolve(user) : reject(new Error('User not found!', 404)),
        )
        .catch(reject),
    );

  changePhone = () =>
    new Promise((resolve, reject) =>
      UserSchema.findByIdAndUpdate(
        this.id,
        { $set: { phone: this.#phone } },
        { new: true },
      )
        .then((user) =>
          user ? resolve(user) : reject(new Error('User not found!', 404)),
        )
        .catch(reject),
    );
};
