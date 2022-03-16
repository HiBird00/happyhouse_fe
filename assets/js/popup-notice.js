
window.onload = function () {
    document.querySelector("#btn-notice-register").addEventListener("click", function () {
        write();
    });
}

function write() {
    let title = $("#title").val();
    let content = $("#content").val();

    if (!title || !content) {
        alert("제목과 내용을 입력해 주세요.");
        return;
    }

    const notice = {
        title,
        content,
        createdAt: new Date()
    };

    let noticeArr = JSON.parse(localStorage.getItem("notice"));
    if (noticeArr) {
        noticeArr = [notice, ...noticeArr];
    } else {
        noticeArr = [notice];
    }
    localStorage.setItem("notice", JSON.stringify(noticeArr));
    alert("등록되었습니다.");
    opener.location.reload();
    self.close();
}
