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
        let code, index = 0;
        console.log(arr)
        arr.forEach((v, idx) => {
            if (v === "none") return true;
            index = idx;
            code = v;
        })
        if (code) {
            console.log('code', code, index);
            $("#apt-list").empty();
            getAptList(code.slice(0, 5), code.slice(-5), 201502, 1);

            let divId, key;
            if (index === 0) {
                divId = "ctprvnCd"; // 시도
                key = code.slice(0, 2);
            } else {
                divId = "signguCd"; // 시군구, 동, 리
                key = code.slice(0, 5);
            }
            //  else {
            //     divId = "adongCd"; // 행정동
            //     key = code;
            // }
            $("#store-list").empty();
            getStoreList(divId, key, 1, index, code);
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
    // console.log(LAWD_CD, DONG_CD, DEAL_YMD)
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


/*****************  상가 정보  *****************/
/*****************  상가 정보  *****************/
/*****************  상가 정보  *****************/
function getStoreList(divId, key, pageNo, index, originCode) {
    let requestData = {
        ServiceKey: "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==",
        pageNo,
        numOfRows: "100",
        divId,
        key,
        type: 'json'
    };
    $.ajax({
        url: "http://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong",
        type: "GET",
        data: requestData,
        dataType: "json",
        success: (response) => {
            let items = response.body?.items;
            if (items?.length) {
                // 데이터가 있으면 출력
                if (index > 1) {
                    // api에서의 행정동과 originCode인 법정동의 코드가 서로 달라서 추가적인 filter처리가 필요하다
                    items = items.filter(item => item.ldongCd === originCode.slice(0, 8) + "00");
                }
                makeStoreList(items);
                getStoreList(divId, key, pageNo + 1, index, originCode);
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만
            }
        },
        error: (err) => { console.log(err.responseText) },
    })
}

function makeStoreList(data) {
    let storeList = ``;
    data.forEach(element => {
        storeList += `
            <tr>
                <td>${element.bizesId}</td>
                <td>${element.bizesNm}</td>
                <td>${element.indsMclsNm}</td>
                <td>${element.lnoAdr}</td>
                <td>${element.rdnm}</td>
                <td>${element.newZipcd}</td>
                <td>${element.lon}</td>
                <td>${element.lat}</td>
            </tr>
        `;
    });

    $("#store-list").append(storeList);
}
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
        let code, index = 0;
        console.log(arr)
        arr.forEach((v, idx) => {
            if (v === "none") return true;
            index = idx;
            code = v;
        })
        if (code) {
            console.log('code', code, index);
            $("#apt-list").empty();
            getAptList(code.slice(0, 5), code.slice(-5), 201502, 1);

            let divId, key;
            if (index === 0) {
                divId = "ctprvnCd"; // 시도
                key = code.slice(0, 2);
            } else {
                divId = "signguCd"; // 시군구, 동, 리
                key = code.slice(0, 5);
            }
            //  else {
            //     divId = "adongCd"; // 행정동
            //     key = code;
            // }
            $("#store-list").empty();
            getStoreList(divId, key, 1, index, code);
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
    // console.log(LAWD_CD, DONG_CD, DEAL_YMD)
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


/*****************  상가 정보  *****************/
/*****************  상가 정보  *****************/
/*****************  상가 정보  *****************/
function getStoreList(divId, key, pageNo, index, originCode) {
    let requestData = {
        ServiceKey: "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==",
        pageNo,
        numOfRows: "100",
        divId,
        key,
        type: 'json'
    };
    $.ajax({
        url: "http://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong",
        type: "GET",
        data: requestData,
        dataType: "json",
        success: (response) => {
            let items = response.body?.items;
            if (items?.length) {
                // 데이터가 있으면 출력
                if (index > 1) {
                    // api에서의 행정동과 originCode인 법정동의 코드가 서로 달라서 추가적인 filter처리가 필요하다
                    items = items.filter(item => item.ldongCd === originCode.slice(0, 8) + "00");
                }
                makeStoreList(items);
                getStoreList(divId, key, pageNo + 1, index, originCode);
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만
            }
        },
        error: (err) => { console.log(err.responseText) },
    })
}

function makeStoreList(data) {
    let storeList = ``;
    data.forEach(element => {
        storeList += `
            <tr>
                <td>${element.bizesId}</td>
                <td>${element.bizesNm}</td>
                <td>${element.indsMclsNm}</td>
                <td>${element.lnoAdr}</td>
                <td>${element.rdnm}</td>
                <td>${element.newZipcd}</td>
                <td>${element.lon}</td>
                <td>${element.lat}</td>
            </tr>
        `;
    });

    $("#store-list").append(storeList);
}
