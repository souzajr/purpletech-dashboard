$(document).ready(function() {
    $('#budget').on('submit', function(e) {
        e.preventDefault()
        
        $.ajax({
            type: "POST",
            url: '/budget',
            datatype: "html",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            data: $("#budget").serialize(),
            success: function() {
                alertify.notify('Sucesso!', 'success', 5)
                location.reload()
            },
            error : function(xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})