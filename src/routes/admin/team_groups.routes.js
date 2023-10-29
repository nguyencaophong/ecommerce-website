const teamGroupsController = require('../../controllers/admin/team_groups.controller');

module.exports = require('express').Router()
  .get( '/',teamGroupsController.list)
  .post( '/',teamGroupsController.create)
  .get( '/:id',teamGroupsController.read )
  .put( '/:id',teamGroupsController.update)
  .delete( '/:id',teamGroupsController.delete)
  .post( '/:id/:member',teamGroupsController.addTeamIntoTeamGroup)
  .delete( '/:id/:member',teamGroupsController.deleteTeamInTeamGroup)
