$(document).ready(function () {
    var user = JSON.parse(localStorage.getItem("user"));
    $("#displayName").html(` <input type="text" class="form-control" value="${user.name}" readonly/>`);
    $("#displayEmail").html(` <input type="text" class="form-control" value="${user.email}" readonly/>`);
    $("#displayID").html(` <input type="text" class="form-control" value="${user.id}" readonly/>`);
    $("#displayPassword").html(` <input type="text" class="form-control" value="${user.password}" readonly/>`);
});


$(document).on("click", "#editProfile", function () {
    setForm();
});

$(document).on("click", "#removeProfile", function () {
    if (confirm("탈퇴하시겠습니까?")) {
        localStorage.removeItem("user");
        localStorage.setItem("login", false);
        window.open('./index.html');
        window.close();
    }
});

$(document).on("click", "#editConfirm", function () {
    if (confirm("회원정보를 수정하시겠습니까?")) {
        var user = JSON.parse(localStorage.getItem("user"));
        var name = $("#displayName").children(`input`).val();
        var pw = $("#displayPassword").children(`input`).val();
        var email = $("#displayEmail").children(`input`).val();
        if (pw != "") {
            user.password = pw;
        }
        if (email != "") {
            user.email = email;
        }
        if (name != "") {
            user.name = name;
        }
        localStorage.setItem("user", JSON.stringify(user));
    }
    window.open('./index.html');
    window.close();
});

function setForm() {
    var user = JSON.parse(localStorage.getItem("user"));
    $("#displayName").html(` <input type="text" class="form-control" placeholder="${user.name}" />`);
    $("#displayEmail").html(` <input type="text" class="form-control" placeholder="${user.email}" />`);
    $("#displayID").html(` <input type="text" class="form-control" value="${user.id}" readonly/>`);
    $("#displayPassword").html(` <input type="text" class="form-control" placeholder="${user.password}" />`);

}