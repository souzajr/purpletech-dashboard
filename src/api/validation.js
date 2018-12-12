const validator = require('email-validator')
const passwordValidator = require('password-validator')

module.exports = app => {
    function existOrError(value, msg) {
        if(!value) throw msg
        if(Array.isArray(value) && value.length === 0) throw msg
        if(typeof value === 'string' && !value.trim()) throw msg
    }

    function notExistOrError(value, msg) {
        try {
            existOrError(value, msg)
        } catch(msg) {
            return
        }
        throw msg
    }

    function tooSmall(value, msg) {
        if(value.length < 5) throw msg
    }

    function tooBig(value, msg) {
        if(value.length > 20) throw msg
    }

    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function strongOrError(value, msg) {
        var schema = new passwordValidator()
        if(!schema.is().min(8).validate(value)) throw msg
    }

    function hasDigitOrError(value, msg) {
        var schema = new passwordValidator()
        if(!schema.has().digits().validate(value)) throw msg
    }

    function hasUpperOrError(value, msg) {
        var schema = new passwordValidator()
        if(!schema.has().uppercase().validate(value)) throw msg
    }

    function hasLowerOrError(value, msg) {
        var schema = new passwordValidator()
        if(!schema.has().lowercase().validate(value)) throw msg
    }

    function notSpaceOrError(value, msg) {
        var schema = new passwordValidator()
        if(schema.has().spaces().validate(value)) throw msg
    }

    function hasSpecialOrError(value, msg) {
        var schema = new passwordValidator()
        if(!schema.has().symbols().validate(value)) throw msg
    }

    function validEmailOrError(value, msg) {
        if(!validator.validate(value)) throw msg
    }

    return { 
        existOrError, 
        notExistOrError,
        tooSmall,
        tooBig, 
        equalsOrError, 
        strongOrError, 
        hasDigitOrError,
        hasUpperOrError,
        hasLowerOrError,
        notSpaceOrError,
        hasSpecialOrError,
        validEmailOrError
    }
}