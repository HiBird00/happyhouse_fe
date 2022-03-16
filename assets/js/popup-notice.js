
window.onload = function () {
    let modifyData = JSON.parse(localStorage.getItem("notice-modify"));

    document.querySelector("#btn-notice-register").addEventListener("click", function () {
        if (modifyData) {
            modify(modifyData.index);
        } else {
            write();
        }
    });

    if (modifyData) {
        $("#title").val(modifyData.title);
        $("#content").val(modifyData.content);
        $("#btn-notice-register").text("수정");
    }
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

function modify(index) {
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
    noticeArr[index] = notice;
    localStorage.setItem("notice", JSON.stringify(noticeArr));
    alert("수정되었습니다.");
    localStorage.removeItem("notice-modify");
    opener.location.reload();
    self.close();
}
