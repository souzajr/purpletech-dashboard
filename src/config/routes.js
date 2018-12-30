const admin = require('./admin')

module.exports = app => {
    /* ============= INDEX ============= */
    app.get('/', function(req, res) {
        res.render('index')
    })

    /* ============= REGISTER ============= */
    app.get('/register', function(req, res) {
        res.render('register', { refresh: null, message: null })
    })
    app.post('/register', app.src.api.user.save)

    /* ============= LOGIN ============= */
    app.get('/login', function(req, res) {
        res.render('login', { message: null })
    })
    app.post('/login', app.src.api.auth.login)

    /* ============= FORGOT PASSWORD ============= */
    app.get('/forgotpassword', function(req, res) {
        res.render('forgotpassword', { message: null })
    })
    app.post('/forgotpassword', app.src.api.user.recover)
    app.get('/reset/:token', app.src.api.user.recover)
    app.post('/reset/:token', app.src.api.user.reset)

    /* ============= LOGOUT ============= */
    app.get('/logout', function(req, res) {      
        req.session.destroy()  
        req.logout()
        res.status(200).redirect('/')
    })

    /* ============= VALIDATE USER  ============= */
    app.route('/validate')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.auth.validateToken)

    /* ============= DASHBOARD  ============= */
    app.route('/dashboard')
        .all(app.src.config.passport.authenticate({failureRedirect: '/login' }))
        .get(app.src.api.user.get)

    /* ============= USER PROFILE ============= */
    app.route('/profile')
        .all(app.src.config.passport.authenticate())        
        .get(app.src.api.user.getProfile)
        .put(app.src.api.user.changeProfile)
    
    /* ============= UPLOAD NEW/GET PROFILE PIC ============= */
    app.route('/profilePicture/:id')
        .all(app.src.config.passport.authenticate())        
        .get(app.src.api.user.getProfilePicture)
        .post(app.src.api.user.profilePicture)

    /* ============= CREATE NEW PROJECT ============= */
    app.route('/project')
        .all(app.src.config.passport.authenticate())
        .post(app.src.api.project.save)

    /* ============= VIEW/EDIT PROJECT ============= */
    app.route('/project/:id')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.get)
        .put(admin(app.src.api.project.change))
    app.route('/allproject')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.user.get))

    /* ============= UPLOAD/GET PROJECT FILES ============= */
    app.route('/upload/:id')
        .all(app.src.config.passport.authenticate())
        .post(app.src.api.project.uploadFile)
    app.route('/get/:id/:filename')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.sendFile)  
    app.route('/getThumb/:id/:filename')
        .all(app.src.config.passport.authenticate())
        .get(app.src.api.project.sendFileThumb)      

    /* ============= LIST OF ALL USSER & ADD NEW USER ============= */
    app.route('/users')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.user.getAll))
        .post(admin(app.src.api.user.save))
    app.route('/users/:id')
        .all(app.src.config.passport.authenticate())
        .get(admin(app.src.api.user.getAll))
        .put(admin(app.src.api.user.getAll))
        .delete(admin(app.src.api.user.getAll))

    /* ============= HANDLE ERROR  ============= */ 
    /*app.use(function(err, req, res, next) {
        req.session.reset()
        res.status(500).send(err)
    })*/
    app.use(function(req, res) {
        res.status(404).render('404');
    })
}