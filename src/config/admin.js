
module.exports = middleware => {
    return (req, res, next) => {
        if(req.session.user.admin) {
            middleware(req, res, next)
        } else {
            res.status(401)
            req.session.destroy(function (err) {
                res.render('login', { message: JSON.stringify('Something went wrong') })
            })
        }
    }
}