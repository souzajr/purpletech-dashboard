$(document).ready(function() {
    $('#message').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: 'POST',
            url: '/message',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#message').serialize(),
            success: function(result) {
                alertify.notify(result.msg, 'success', 5)
                setTimeout(function() { 
                    window.location.href = '/message/' + result.id
                }, 500)
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})