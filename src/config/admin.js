
module.exports = middleware => {
    return (req, res, next) => {
        if(req.session.user.admin) {
            middleware(req, res, next)
        } else {
            res.status(401)
            req.session.destroy(function () {
                res.render('enter', { page: '/login', message: JSON.stringify('Algo deu errado') })
            })
        }
    }
}