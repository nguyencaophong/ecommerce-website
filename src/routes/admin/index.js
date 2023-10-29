const passport = require('passport');
const {decentralization} = require('../../middleware/casl.middleware');
function adminRouter(app) {
  app
    .use( '/admin/roles',passport.authenticate('jwt',{session:false}),decentralization,require('./roles.routes'))
    .use( '/admin/permissions',passport.authenticate('jwt',{session:false}),decentralization,require('./permissions.routes'))
    .use( '/admin/users',passport.authenticate('jwt',{session:false}),decentralization,require('./users.routes'))
    .use( '/admin/locations',passport.authenticate('jwt',{session:false}),decentralization,require('./locations.routes'))
    .use( '/admin/trademarks',passport.authenticate('jwt',{session:false}),decentralization,require('./trademarks.routes'))
    .use( '/admin/slides',passport.authenticate('jwt',{session:false}),decentralization,require('./slides.routes'))
    .use('/admin/slides-show',passport.authenticate('jwt',{session:false}),decentralization,require('./slides-show.routes'))
    .use( '/admin/types-slide',passport.authenticate('jwt',{session:false}),decentralization,require('./types_slide.routes'))
    .use( '/admin/types-effect',passport.authenticate('jwt',{session:false}),decentralization,require('./types_effect.routes'))
    .use( '/admin/contacts',passport.authenticate('jwt',{session:false}),decentralization,require('./contacts.routes'))
    .use( '/admin/teams',passport.authenticate('jwt',{session:false}),decentralization,require('./teams.routes'))
    .use( '/admin/team-groups',passport.authenticate('jwt',{session:false}),decentralization,require('./team_groups.routes'))
    .use( '/admin/team-positions',passport.authenticate('jwt',{session:false}),decentralization,require('./team_positions.routes'))
    .use( '/admin/news',passport.authenticate('jwt',{session:false}),decentralization,require('./news.routes'))
    .use( '/admin/categories',passport.authenticate('jwt',{session:false}),decentralization,require('./categories.routes'))
    .use( '/admin/students',passport.authenticate('jwt',{session:false}),decentralization,require('./students.routes'))
    .use( '/admin/courses',passport.authenticate('jwt',{session:false}),decentralization,require('./courses.routes'))
    .use( '/admin/search',passport.authenticate('jwt',{session:false}),decentralization,require('./search.routes'))
    .use( '/admin/histories',passport.authenticate('jwt',{session:false}),decentralization,require('./histories.routes'))
    .use( '/admin/visits',passport.authenticate('jwt',{session:false}),decentralization,require('./visits.routes'))
    .use( '/admin/commons',passport.authenticate('jwt',{session:false}),decentralization,require('./commons.routes'))
    .use( '/admin/locations',passport.authenticate('jwt',{session:false}),decentralization,require('./locations.routes'))
    .use( '/admin/dashboard',passport.authenticate('jwt',{session:false}),decentralization,require('./info.routes'))
}

module.exports = adminRouter;
