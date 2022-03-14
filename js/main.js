$(function () {
    // 시/도를 불러오는 함수입니다.
    getJusoByCode({
        regcode_pattern: "*00000000",
    }, 'city');

    // 시/도가 선택되었을 시 시/군/구를 불러오는 함수입니다.
    $(document).on("change", "select[name='city']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 2) + "*00000",
            is_ignore_zero: true
        }, 'gu');
    })

    // 시/군/구가 선택되었을 시 읍/면/동을 불러오는 함수입니다.
    $(document).on("change", "select[name='gu']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 5) + "*",
            is_ignore_zero: true
        }, 'dong');
    })

    // 읍/면/동이 선택되었을 시 리를 불러오는 함수입니다.
    $(document).on("change", "select[name='dong']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 7) + "*",
            is_ignore_zero: true
        }, 'ri');
    })

    // 검색을 클릭했을 경우, 선택한 부분까지의 주소로 데이터를 불러옵니다.
    $(document).on("click", "#juso-search-btn", function (event) {
        event.preventDefault();
        let city = $("select[name='city']").val();  // 선택된 시/도
        let gu = $("select[name='gu']").val();      // 선택된 시/군/구
        let dong = $("select[name='dong']").val();  // 선택된 읍/면/동
        let ri = $("select[name='ri']").val();      // 선택된 리
        let arr = [city, gu, dong, ri];
        let code, index = 0;

        // 위의 네 가지의 주소가 모두 선택되지 않는 경우가 있으므로, 선택된 곳 까지의 주소 코드를 선택한다.
        arr.forEach((v, idx) => {
            if (v === "none") return true;
            index = idx;
            code = v;
        })
        if (code) {
            console.log('code', code, index);
            $("#apt-list").empty(); // 아파트 리스트를 초기화 합니다.
            getAptList(code.slice(0, 5), code.slice(-5), 201502, 1);    // 아파트 리스트를 출력하기 위해 시/구 코드, 동 코드, 날짜, 페이지 수를 파라미터로 전송합니다.

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
            $("#store-list").empty();   // 상권 리스트를 초기화 합니다.
            getStoreList(divId, key, 1, index, code);   // 상권 리스트를 출력하기 위해 key에 해당하는 ID(divId)와 페이지 수, 동/리를 예외처리 하기 위한 index, 원래 code를 전송합니다.
        }
    })

    getCCTVList();
    getHospital();
    getSeoulResidentStat();
})

// 주소 코드를 통해 주소를 불러오는 함수입니다.
function getJusoByCode(data, name) {
    $.ajax({
        url: "https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes",
        type: "GET",
        data,
        dataType: "json",
        success: (res => {
            console.log(res);
            printToSelect(name, res?.regcodes ? res.regcodes : []); // select에 주소를 출력합니다. 만약, 데이터가 없으면 빈 array를 전송합니다.
        })
    })
}


// select에 주소를 출력하는 함수입니다.
function printToSelect(name, response) {
    let selectInfo = ``;
    response.forEach(element => {
        let eName = element.name;
        let spt = eName.split(" ");
        if (name === 'gu') {
            eName = spt.slice(1).join(" "); // 시/군/구인 경우 맨 첫 index가 가지는 시/도를 제외하고 불러옵니다. (수원시, 성남시는 구까지 포함)
        } else {
            if (name === 'dong') {
                if (element.code.slice(-2) !== "00") return; // 만약 읍/면/동을 출력하려는데, 리까지 포함되어있는 옵션이라면 출력하지 않습니다. (ex. 가평읍)
            } else if (name === 'ri') {
                if (element.code.slice(-2) == '00') return; // 리를 출력하려는데 리가 포함되어있지 않다면 출력하지 않습니다.
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
                console.log(items)
                makeList(items, DONG_CD);
                getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo + 1)  // page를 증가시키며 데이터를 계속 호출합니다.
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
            }
        },
        error: () => { },
    });
}


// 아파트 리스트를 출력하는 함수입니다.
function makeList(data, DONG_CD) {
    let aptList = ``;
    data.each(function () {
        console.log($(this).find("법정동읍면동코드").text(), DONG_CD)
        if (DONG_CD != "00000" && $(this).find("법정동읍면동코드").text() !== DONG_CD) return true;     // 구 코드까지만 호출한 데이터이므로, 동에 대한 예외처리를 해줍니다.
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
// 상가정보를 얻는 함수입니다.
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
                    // api에서의 행정동과 originCode인 법정동의 코드가 서로 달라서 추가적인 filter처리가 필요합니다.
                    items = items.filter(item => item.ldongCd === originCode.slice(0, 8) + "00");
                }
                makeStoreList(items);
                getStoreList(divId, key, pageNo + 1, index, originCode);    // page를 증가시키며 데이터를 계속 호출합니다.
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
            }
        },
        error: (err) => { console.log(err.responseText) },
    })
}

// 상가 정보를 출력하는 함수입니다.
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



/*****************  CCTV  *****************/
const seoulKey = "4955426858776e68363059744f7875";  // 서울 광장 데이터 api 키

// cctv 정보를 얻어오는 함수입니다.
function getCCTVList() {
    let startIdx = 1;
    let endIdx = 10;
    let gu = "강남구";
    let url = `http://openapi.seoul.go.kr:8088/${seoulKey}/json/safeOpenCCTV/${startIdx}/${endIdx}/${gu}`;
    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: (response) => {
            console.log("cctv", response);
        }
    })
}

/*****************  선별진료소 / 안심병원  *****************/
function getHospital() {
    let ServiceKey = "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==";
    let requestData = {
        ServiceKey,
        pageNo: 1,
        numOfRows: 10
    };
    $.ajax({
        url: "http://apis.data.go.kr/B551182/rprtHospService/getRprtHospService",
        type: "GET",
        data: requestData,
        dataType: "xml",
        success: (response) => {
            console.log("호흡기 의원", response);
        }
    })

}


/*****************  서울 인구 통계  *****************/
function readTextFile(file) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file, false);
    xmlhttp.send(null);

    if (xmlhttp.status === 200) {
        return xmlhttp.responseText;
    }
    return null;
}

// txt 파일을 json으로 파싱하는 함수입니다.
function txtToJson(data, cIdx) {
    const stpData = data.split('\n');
    const columns = stpData[cIdx].split("\t");      // 첫 줄은 컬럼
    let jsonData = [];

    // txt파일을 json객체로 변환하여 배열에 추가
    for (let i = cIdx + 1; i < stpData.length; i++) {
        let temp = stpData[i].split("\t");
        let json = columns.reduce(function (newJson, column, idx) {
            newJson[column] = temp[idx];
            return newJson;
        }, {});
        jsonData.push(json);
    }
    return jsonData;
}


// 서울 인구 통계 자료를 불러오고, json으로 파싱하는 함수입니다.
function getSeoulResidentStat() {
    let files = ["./xls/seoul_age.txt", "./xls/seoul_foreigner.txt"];
    let name = ["연령통계", "외국인통계"];
    let cIdx = [0, 1];
    files.forEach((file, idx) => {
        const data = readTextFile(file);
        console.log(name[idx], txtToJson(data, cIdx[idx]));
    })

}

