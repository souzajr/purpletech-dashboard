$(document).ready(function () {
    $('.checkbox-status').click(function (e) {
        $.ajax({
            type: 'PUT',
            url: '/taskStatus/<%= project._id %>',
            datatype: 'html',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            data: $('#checkbox-todo-form').serialize(),
            error: function (xhr, status, error) {
                alertify.notify(JSON.parse(xhr.responseText), 'error', 5)
            },
        })
    })
})