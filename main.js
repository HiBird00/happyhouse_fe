$(function () {
    // city call
    getJusoByCode({
        regcode_pattern: "*00000000",
    }, 'city');

    $(document).on("change", "select[name='city']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 2) + "*00000",
            is_ignore_zero: true
        }, 'gu');
    })

    $(document).on("change", "select[name='gu']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 5) + "*",
            is_ignore_zero: true
        }, 'dong');
    })

    $(document).on("change", "select[name='dong']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 7) + "*",
            is_ignore_zero: true
        }, 'ri');
        // let date = new Date();
        // 현재 날짜 기준
        //getAptList($(this).val().slice(0, 5), $(this).val().slice(-5), date.getFullYear() + ("00" + (date.getMonth() + 1)).slice(-2))
        // getAptList($(this).val().slice(0, 5), $(this).val().slice(-5), 201502, 1)
    })

    $(document).on("click", "#juso-search-btn", function (event) {
        event.preventDefault();
        let city = $("select[name='city']").val();
        let gu = $("select[name='gu']").val();
        let dong = $("select[name='dong']").val();
        let ri = $("select[name='ri']").val();
        let arr = [city, gu, dong, ri];
        let code;
        for (let v of arr) {
            if (v === 'none') break;
            code = v;
        }
        if (code) {
            console.log("code", code);
            $("#apt-list").empty();
            getAptList(code.slice(0, 5), code.slice(-5), 201502, 1)
        }
    })
})

function getJusoByCode(data, name) {
    $.ajax({
        url: "https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes",
        type: "GET",
        data,
        dataType: "json",
        success: (res => {
            console.log(res);
            printToSelect(name, res?.regcodes ? res.regcodes : []);
        })
    })
}

function printToSelect(name, response) {
    // Array
    let selectInfo = ``;
    response.forEach(element => {
        let eName = element.name;
        let spt = eName.split(" ");
        if (name === 'gu') {
            eName = spt.slice(1).join(" ");
        } else {
            if (name === 'dong') {
                if (element.code.slice(-2) !== "00") return; // 리 존재
            } else if (name === 'ri') {
                if (element.code.slice(-2) == '00') return;
            }
            eName = spt[spt.length - 1];
        }
        selectInfo += `
            <option value=${element.code}>${eName}</option>
        `;
    });
    let option = $(`select[name=${name}] > option:first`)[0];
    $(`select[name=${name}]`).empty().append(option).append(selectInfo);
}

function getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo) {
    console.log(LAWD_CD, DONG_CD, DEAL_YMD)
    let requestData = {
        serviceKey:
            "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==",
        pageNo,
        numOfRows: "30",
        LAWD_CD,
        DEAL_YMD,
    };

    $.ajax({
        url: "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev",
        type: "GET",
        data: requestData,
        dataType: "xml",
        success: (response) => {
            console.log(response);
            let items = $(response).find("item");
            if (items.length) {
                // 데이터가 있으면 출력
                makeList(items, DONG_CD);
                getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo + 1)
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만
            }
        },
        error: () => { },
    });
}

function makeList(data, DONG_CD) {
    let aptList = ``;
    data.each(function () {
        if (DONG_CD != "00000" && $(this).find("법정동읍면동코드").text() !== DONG_CD) return true;
        aptList += `
                <tr>
                    <td>${$(this).find("아파트").text()}</td>
                    <td>${$(this).find("층").text()}</td>
                    <td>${$(this).find("전용면적").text()}</td>
                    <td>${$(this).find("법정동").text()}</td>
                    <td>${$(this).find("거래금액").text()}</td>
                </tr>
              `;
    });
    $("#apt-list").append(aptList);
    $("tr:first").css("background", "black").css("color", "white");
    $("tr:even").css("background", "gray");
}