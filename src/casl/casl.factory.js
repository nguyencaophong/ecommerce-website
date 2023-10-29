const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

module.exports = (user) => {
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);
  const permissions = [];
  user.roles.map(
    (e) => e.permissions && e.permissions.map((p) => permissions.push(p))
  );
  for (i of permissions) {
    i.can
      ? can(
        i.action,
        i.subject,
        i.fields && i.fields,
        i.conditions && i.conditions
      )
      : cannot(
        i.action,
        i.subject,
        i.fields && i.fields,
        i.conditions && i.conditions
      );
  }
  return new createMongoAbility(rules);
};
