const fs = require('fs')
module.exports = _ => {
    async function ensureExists(path, mask, cb) {
        if (typeof mask == 'function') {
            cb = mask;
            mask = 0777;
        }
        for(let i = 0; i < path.length; i++) {
            await fs.mkdir(path[i], mask, function(err) {
                if (err) {
                    if (err.code == 'EEXIST') cb(null); 
                    else cb(err) 
                } else cb(null)
            })
        }
    }

    ensureExists([
        './public',
        './public/upload',
        './public/upload/profile',
        './public/upload/thumb'
        ], 0744, function(err) {
        if (err) console.log(err)
    })
}