// const rolesController = require('../controllers/admin/roles.controller')
// const permissionsController = require('../controllers/admin/permissions.controller')
// const usersController = require('../controllers/admin/users.controller');
// const locationsController = require('../controllers/admin/locations.controller');
// const slidesController = require('../controllers/admin/slides.controller');
// const typesSlideController = require('../controllers/admin/types_slide.controller');
// const typesEffectController = require('../controllers/admin/types_effect.controller');
// const contactsController = require('../controllers/admin/contacts.controller');
// const teamsController = require('../controllers/admin/teams.controller');
// const teamGroupsController = require('../controllers/admin/team_groups.controller');
// const positionsController = require('../controllers/admin/positions.controller');
// const sharesController = require('../controllers/admin/shares.controller');
// const categoriesController = require('../controllers/admin/categories.controller');
// const typesShareController = require('../controllers/admin/types_share.controller');
// const studentsController = require('../controllers/admin/students.controller');
// const coursesController = require('../controllers/admin/courses.controller');
// const searchController = require('../controllers/admin/search.controller');
// const historiesController = require('../controllers/admin/histories.controller');
// const visitsController = require('../controllers/admin/visits.controller');
// const trademarksController = require('../controllers/admin/trademarks.controller');
// const commonController = require('../controllers/admin/common.controller');


// const transfer = require('../middleware/transfer.middleware').upload;

// module.exports = require('express').Router()
//   // **  roles & permissions
//   .post('/role',rolesController.create)
//   .get('/role',rolesController.list)
//   .put('/role/:id',rolesController.update)
//   .delete('/role/:id',rolesController.delete)
//   .get('/permission',permissionsController.read)

//   // **  user 
//   .post('/users',usersController.create)
//   .get('/users',usersController.list)
//   .patch('/user/:id/role', usersController.updateRoles)
//   .put('/user/:id/block',usersController.block)
//   .delete('/user/:id',usersController.delete)
  
//   // **  ('training','product','mission','vision','introduce','location','trademark')
//   .get( '/manager',commonController.readCommon)
//   // **  (product,mission,vision,training,introduce)
//   .put( '/s/:collection/:id',transfer.array('upload',20),commonController.updateCommon)

//   // **  location
//   .post( '/location/:element',locationsController.create)
//   .put( '/location/:element/:id',locationsController.update)
//   .delete( '/location/:element/:id',locationsController.delete)

//   // **  trademark
//   .put( '/trademark/:element',transfer.array('upload',20),trademarksController.update )
//   .delete( '/trademark/:element/:id',trademarksController.delete )


//   // **  slide
//   .get( '/slides',slidesController.list)
//   .get( '/slide/:id',slidesController.read)
//   .put( '/slide/:id',transfer.array('upload',20),slidesController.update)
//   .delete( '/slide/:id',slidesController.delete)

//   // **  type slide
//   .get( '/typeslides',typesSlideController.list)
//   .get( '/typeslide/:id',typesSlideController.read)
//   .post( '/typeslide',transfer.array('upload',20),typesSlideController.create)
//   .put( '/typeslide/:id',transfer.array('upload',20),typesSlideController.update)
//   .put( '/typeslide/:id/:effect',typesSlideController.addEffect)
//   .patch('/typeslide/:id',typesSlideController.isPost)
//   .delete( '/typeslide/:id',typesSlideController.delete)

//   // **  type effect
//   .get( '/typeeffects',typesEffectController.list)
//   .get( '/typeeffect/:id',typesEffectController.read)
//   .post( '/typeeffect',typesEffectController.create)
//   .put( '/typeeffect/:id',typesEffectController.update)
//   .delete( '/typeeffect/:id',typesEffectController.delete)

//   // **  contact collection
//   .get( '/contacts',contactsController.list)
//   .put( '/contact/:id',contactsController.update)
//   .delete( '/contact/:id',contactsController.delete)

//   // **  team
//   .get( '/teams',teamsController.list)
//   .get( '/team/:id',teamsController.read)
//   .post( '/team',transfer.array('upload',20),teamsController.create)
//   .put( '/team/:id',transfer.array('upload',20),teamsController.update)
//   .delete( '/team/:id',teamsController.delete)

//   // **  TeamGroup
//   .get( '/teamgroups',teamGroupsController.list)
//   .post( '/teamgroup',teamGroupsController.create)
//   .get( '/teamgroup/:id',teamGroupsController.read )
//   .put( '/teamgroup/:id',teamGroupsController.update)
//   .delete( '/teamgroup/:id',teamGroupsController.delete)
//   .post( '/teamgroup/:id/:teamid',teamGroupsController.addTeamIntoTeamGroup)
//   .delete( '/teamgroup/:id/:teamid',teamGroupsController.deleteTeamInTeamGroup)

//   // **  PositionTeam
//   .get( '/teampositions',positionsController.list)
//   .get( '/teamposition/:id',positionsController.read )
//   .post( '/teamposition',positionsController.create)
//   .put( '/teamposition/:id',positionsController.update)
//   .delete( '/teamposition/:id',positionsController.delete)

//   // **  shares
//   .get( '/shares',sharesController.list)
//   .get( '/share/:id',sharesController.read)
//   .post( '/share',transfer.array('upload',20),sharesController.create)
//   .put( '/share/:id',transfer.array('upload',20),sharesController.update)
//   .delete( '/share/:id',sharesController.delete)

//   // **  categories
//   .get( '/categories',categoriesController.list)
//   .get( '/categories/:id',categoriesController.read)
//   .post( '/categories',categoriesController.create)
//   .put( '/categories/:id',categoriesController.update)
//   .delete( '/categories/:id',categoriesController.delete)

//   // **  typeshare-
//   .get( '/typeshares',typesShareController.list)
//   .get( '/typeshare/:id',typesShareController.read)
//   .post( '/typeshare',typesShareController.create)
//   .put( '/typeshare/:id',typesShareController.update)
//   .delete( '/typeshare/:id',typesShareController.delete)

//   // **  Student
//   .get( '/students',studentsController.list)
//   .post( '/student',studentsController.create)
//   .get( '/student/:id',studentsController.read)
//   .put( '/student/:id',transfer.single('avatar'),studentsController.update)
//   .delete( '/student/:id',studentsController.delete)
//   .get( '/student/:id/courses',studentsController.readCoursesOfStudent)
//   .get( '/student/:targetid/:childrentarget',studentsController.readInfo)
//   .post( '/student/:targetid/:childrentarget',studentsController.createInfo)
//   .put( '/student/:targetid/:childrentarget/:index',studentsController.updateInfo)
//   .delete( '/student/:targetid/:childrentarget/:index',studentsController.deleteInfo)

//   // **  Course
//   .get( '/courses',coursesController.list)
//   .get( '/course/:id',coursesController.read)
//   .put( '/course/:id',transfer.array('upload',20),coursesController.update)
//   .post( '/course',transfer.array('upload',20),coursesController.create)
//   .delete( '/course/:id',coursesController.delete)
//   .get( '/course/:id/students',coursesController.readUsersOfCourse)
//   .get( '/course/:targetid/:childrentarget',coursesController.readInfo)
//   .post( '/course/:targetid/:childrentarget',coursesController.createInfo)
//   .put( '/course/:targetid/:childrentarget/:index',coursesController.updateInfo)
//   .delete( '/course/:targetid/:childrentarget/:index',coursesController.deleteInfo)

//   // ** search
//   .post( '/search/:collection',searchController.read)

//   // ** dashboard 
//   .get('/histories',historiesController.histories)
//   .get('/visits',visitsController.visit)

//   // ** upload image
//   .post( '/uploads',commonController.previewImage)

