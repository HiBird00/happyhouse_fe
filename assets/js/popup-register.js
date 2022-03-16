$(function () {
    makeProfileList();
});

function windowClose() {
    opener.parent.location.reload();
    window.close();
}

function regist() {
    // 문서에서 id 로 input data 가져오기
    let id = document.getElementById("id").value;
    let password = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    // 입력값 검증
    if (!id || !password || !name || !email) {
        alert("빈칸이 없도록 입력해주세요.");
        return;
    }
    // input data로 user 만들기
    const user = {
        id: id,
        password: password,
        name: name,
        email: email,
    };
    // user 객체 문자열로 바꿔서 로컬스토리지에 저장
    localStorage.setItem("user", JSON.stringify(user));
    alert("사용자 등록 성공!");
    // 로그인 화면으로 돌아가기
    windowClose();
}

function login() {
    // 문서에서 id로 input data 가져오기
    let id = document.getElementById("id").value;
    let password = document.getElementById("password").value;

    // 로컬스토리지에 "user" 키로 저장된 item 가져와서 json 객체로 만들기
    const user = JSON.parse(localStorage.getItem("user"));

    // 입력값 검증
    if (localStorage.getItem("login") === "true") {
        alert("이미 로그인 되어있습니다.");
        window.location.reload();
        return;
    }

    if (user.id === id && user.password === password) {
        alert("로그인 성공 !");
        localStorage.setItem("login", true);
        window.location.reload();
        // 로그인 성공하면 index 페이지로 이동.
    } else {
        alert("로그인 실패 !");
    }
}


function makeProfileList() {
    let profileList = ``;
    profileList += `
        
        <a class="dropdown-item d-flex " href="user-info.html">
        <i class="bi bi-person"></i>
        <button style="border: none; padding: none; margin: none;">My Profile</button>
        </a>

        <hr class="dropdown-divider">
        <a class="dropdown-item d-flex align-items-center" href="#">
        <i class="bi bi-box-arrow-right"></i>
        <button onclick="signout()" style="border: none; padding: none; margin: none;">Sign Out</button>
        </a>
        
        `;
    if (localStorage.getItem("login") === "true") {
        $("#profile-list").append(profileList);
    }
    else {

        let str = `        
        <a class="dropdown-item d-flex ">
        <button style="border: none; padding: none; margin: none;">로그인해 주세요.</button>
        </a>`;
        $("#profile-list").append(str);
    }

}

function signout() {
    localStorage.setItem("login", false);
    alert("로그아웃 되었습니다");
    window.location.reload();
}