$(document).ready(function() {
    $('#budget').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: 'POST',
            url: '/project',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#budget').serialize(),
            success: function(result) {
                alertify.notify(result, 'success', 5)
                setTimeout(function() { 
                    window.location.href = '/dashboard'
                }, 1000)
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})

$(document).ready(function() {
    $('#profile').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: 'PUT',
            url: '/profile',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#profile').serialize(),
            success: function(result) {
                alertify.notify(result.msg, 'success', 5)
                if(result.name) $('#name').html(result.name)
                if(result.email) $('#email').html(result.email)
                $('#profile')[0].reset()
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})

$(document).ready(function() {
    $('#register').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: 'POST',
            url: '/register',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#register').serialize(),
            success: function(result) {          
                alertify.notify(result, 'success', 5)
                setTimeout(function(){ 
                    window.location.href = '/login'
                }, 1000)
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})

$(document).ready(function() {
    $('#login').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: 'POST',
            url: '/login',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#login').serialize(),
            success: function() {          
                window.location.href = '/validate'
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})