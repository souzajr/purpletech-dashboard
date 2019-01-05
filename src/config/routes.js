const admin = require('./admin')
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy


passport.use(new Strategy({
    clientID: '285500958802172',
    clientSecret: '85db915e7d98c5a8f397cdfc2d8bc3a8',
    callbackURL: 'https://app.purpletech.com.br/OAuth/Facebook'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('teste 2')
    User.findOne({ facebookId: profile.id }, function (err, user) {
        return cb(err, user)
    }).catch(_ => console.log('teste'))
  }
))

module.exports = app => {
    /* ============= INDEX / LOGIN ============= */
    app.get('/', function(req, res) {
        res.render('login', { message: null })
    })
    app.post('/login', app.src.api.auth.login)
    app.get('/login/facebook', passport.authenticate('facebook'))
    app.get('/OAuth/Facebook', passport.authenticate('facebook', { failureRedirect: '/' }),
        function(req, res) {
            res.render('login', { message: JSON.stringify('Sucesso!') });
    })

    /* ============= REGISTER ============= */
    app.get('/register', function(req, res) {
        res.render('register', { message: null })
    })
    app.post('/register', app.src.api.user.registerNewUser)

    /* ============= CHANGE PASSWORD ============= */
    /* ============= IF THE USER WAS CREATED BY ADMIN ============= */
    app.route('/newPassword')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.user.viewNewPassword)
        .post(app.src.api.user.createNewPassword)

    /* ============= USER FIRST LOGIN ============= */
    app.route('/newProject')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.user.viewNewProjectFirstAccess)
        .post(app.src.api.project.createNewProject)

    /* ============= FORGOT PASSWORD ============= */
    app.get('/forgotpassword', function(req, res) {
        res.render('forgotpassword', { message: null })
    })
    app.post('/forgotpassword', app.src.api.user.recoverPassword)
    app.get('/reset/:token', app.src.api.user.recoverPassword)
    app.post('/reset/:token', app.src.api.user.resetPassword)

    /* ============= LOGOUT ============= */
    app.get('/logout', function(req, res) {
        req.session.reset()          
        req.logout()     
        res.status(200).redirect('/')
    })

    /* ============= VALIDATE USER  ============= */
    app.route('/validate')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.auth.validateToken)

    /* ============= DASHBOARD  ============= */
    app.route('/dashboard')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.user.viewDashboard)

    /* ============= USER PROFILE ============= */
    app.route('/profile')
        .all(app.src.config.passport.authenticate())        
        .get(app.src.api.user.viewProfile)
        .put(app.src.api.user.changeProfile)
    
    /* ============= UPLOAD NEW/GET PROFILE PIC ============= */
    app.route('/profilePicture/:id')
        .all(app.src.config.passport.authenticate())        
        .get(app.src.api.user.getProfileAvatar)
        .post(app.src.api.user.uploadProfileAvatar)

    /* ============= CREATE NEW PROJECT BY NORMAL USER ============= */
    app.route('/project')
        .all(app.src.config.passport.authenticate())
        .post(app.src.api.project.createNewProject)

    /* ============= CREATE NEW PROJECT BY ADMIN USER ============= */
    app.route('/budget')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.project.viewBudget))
        .post(admin(app.src.api.project.createNewProjectAdmin))    

    /* ============= VIEW/EDIT PROJECT ============= */
    app.route('/project/:id')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.viewProject)
        .put(admin(app.src.api.project.changeProject))
    app.route('/allprojects')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.project.viewAllProjects))

    /* ============= UPLOAD/GET PROJECT FILES ============= */
    app.route('/upload/:id')
        .all(app.src.config.passport.authenticate())
        .post(app.src.api.project.uploadProjectFile)
    app.route('/get/:id/:filename')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.getProjectFile)  
    app.route('/getThumb/:id/:filename')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.getProjectFileThumb)      

    /* ============= LIST OF ALL USSER & ADD NEW USER ============= */
    app.route('/users')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.user.viewAllUsers))
        .post(admin(app.src.api.user.registerNewUserAdmin))
    app.route('/users/:id')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.user.viewUser))
        .put(admin(app.src.api.user.changeUser))
        .delete(admin(app.src.api.user.removeUser))


    /* ============= MESSAGE  ============= */
    app.route('/message')
        .all(app.src.config.passport.authenticate())
        .get(function(req, res) {
            res.render('./dashboard/index', { 
                user: req.session.user,
                page: req.url,
                message: null
            })
        })
    /* ============= INVOICE  ============= */
    app.route('/invoice')
    .all(app.src.config.passport.authenticate())
    .get(function(req, res) {
        res.render('./dashboard/index', { 
            user: req.session.user,
            page: req.url,
            message: null
        })
    })
    /* ============= SUPPORT  ============= */
    app.route('/support')
    .all(app.src.config.passport.authenticate())
    .get(function(req, res) {
        res.render('./dashboard/index', { 
            user: req.session.user,
            page: req.url,
            message: null
        })
    })

    /* ============= HANDLE ERROR  ============= */
    if(process.env.AMBIENT_MODE == 'PROD') {
        app.use(function (err, req, res, next) { 
            res.status(500).render('500')
        })

        app.get('*', function(req, res) {
            res.redirect('https://purpletech.com.br/404')
        })
    } else {  
        app.use('*', function(req, res) {
            res.status(404).send('404');
        })
    }
}