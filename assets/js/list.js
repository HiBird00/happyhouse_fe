$(function () {
    // 년/월 select box 초기화
    for (let i = new Date().getFullYear(); i >= 2000; i--) {
        $("select[name='main-year']").append(`<option value=${i}>${i}</option>`);;
    }
    for (let i = 1; i <= 12; i++) {
        $("select[name='main-month']").append(`
            <option value=${("00" + i).slice(-2)}>${i}</option>
        `);
    }

    $("select[name='main-year']").val(new Date().getFullYear());
    $("select[name='main-month']").val(("00" + (new Date().getMonth() + 1)).slice(-2));


    // 시/도를 불러오는 함수입니다.
    getJusoByCode({
        regcode_pattern: "*00000000",
    }, 'main-city');

    // 시/도가 선택되었을 시 시/군/구를 불러오는 함수입니다.
    $(document).on("change", "select[name='main-city']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 2) + "*00000",
            is_ignore_zero: true
        }, 'main-gu');
    })

    // 시/군/구가 선택되었을 시 읍/면/동을 불러오는 함수입니다.
    $(document).on("change", "select[name='main-gu']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 5) + "*",
            is_ignore_zero: true
        }, 'main-dong');
    })

    // 읍/면/동이 선택되었을 시 리를 불러오는 함수입니다.
    $(document).on("change", "select[name='main-dong']", function () {
        getJusoByCode({
            regcode_pattern: $(this).val().slice(0, 7) + "*",
            is_ignore_zero: true
        }, 'main-ri');
    })

    // 검색을 클릭했을 경우, 선택한 부분까지의 주소로 데이터를 불러옵니다.
    $(document).on("click", "#apt-search-btn", function (event) {
        event.preventDefault();
        let city = $("select[name='main-city']").val();  // 선택된 시/도
        let gu = $("select[name='main-gu']").val();      // 선택된 시/군/구
        let dong = $("select[name='main-dong']").val();  // 선택된 읍/면/동
        let ri = $("select[name='main-ri']").val();      // 선택된 리
        let year = $("select[name='main-year']").val();      // 선택된 리
        let month = $("select[name='main-month']").val();      // 선택된 리
        let arr = [city, gu, dong, ri];
        let code, index = 0;

        if (!city || !gu) {
            alert("시/도와 시/군/구는 필수 정보입니다.");
            return;
        }

        if (!year || !month) {
            alert("거래일자를 선택하세요.");
            return;
        }

        // 위의 네 가지의 주소가 모두 선택되지 않는 경우가 있으므로, 선택된 곳 까지의 주소 코드를 선택한다.
        arr.forEach((v, idx) => {
            if (!v) return true;
            index = idx;
            code = v;
        })

        if (code) {
            console.log('code', code, index);
            $("#apt-list").empty()
            $("#store-list").empty()
            $("#apt-progress").append(`<div class="spinner-border text-primary"></div>`);
            $("#store-progress").append(`<div class="spinner-border text-primary"></div>`);
            getAptList(code.slice(0, 5), code.slice(-5), year + month, 1);    // 아파트 리스트를 출력하기 위해 시/구 코드, 동 코드, 날짜, 페이지 수를 파라미터로 전송합니다.

            let divId, key;
            if (index === 0) {
                divId = "ctprvnCd"; // 시도
                key = code.slice(0, 2);
            } else {
                divId = "signguCd"; // 시군구, 동, 리
                key = code.slice(0, 5);
            }
            getStoreList(divId, key, 1, index, code);   // 상권 리스트를 출력하기 위해 key에 해당하는 ID(divId)와 페이지 수, 동/리를 예외처리 하기 위한 index, 원래 code를 전송합니다.
        }
    })
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
            let items = $(response).find("item");
            if (items.length) {
                // 데이터가 있으면 출력
                console.log(items)
                makeList(items, DONG_CD, pageNo);
                getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo + 1)  // page를 증가시키며 데이터를 계속 호출합니다.
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
                $("#apt-progress").empty();
            }
        },
        error: () => { },
    });
}


// 아파트 리스트를 출력하는 함수입니다.
function makeList(data, DONG_CD, pageNo) {
    let aptList = ``;
    data.each(function (idx) {
        if (DONG_CD != "00000" && $(this).find("법정동읍면동코드").text() !== DONG_CD) return true;     // 구 코드까지만 호출한 데이터이므로, 동에 대한 예외처리를 해줍니다.
        let city = $("select[name='main-city'] option:checked").text();  // 선택된 시/도
        let gu = $("select[name='main-gu'] option:checked").text();      // 선택된 시/군/구
        let addr = `${city} ${gu} ${$(this).find("도로명").text()} ${$(this).find("지번").text()}`;
        if ($(this).find("층").text()) {
            addr += `${$(this).find("층").text()}층`;
        }
        aptList += `
                <tr>
                    <th scope="row" class="col-1">${(pageNo - 1) * 30 + 1 + idx}</th>
                    <td class="col-3">${$(this).find("아파트").text()}</td>
                    <td class="col-3">${addr}</td>
                    <td class="col-3">${$(this).find("전용면적").text()}</td>
                    <td class="col-3">${$(this).find("거래금액").text()}</td>
                </tr>
            `;
    });
    $("#apt-list").append(aptList);
};


var storeCnt = 0;
/*****************  상가 정보  *****************/
// 상가정보를 얻는 함수입니다.
function getStoreList(divId, key, pageNo, index, originCode) {
    console.log(divId, key, pageNo, index, originCode)
    let requestData = {
        serviceKey: "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==",
        pageNo,
        numOfRows: "5",
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
            // console.log("상권", response)
            let items = response.body?.items;
            if (items?.length) {
                // 데이터가 있으면 출력
                if (index > 1) {
                    // api에서의 행정동과 originCode인 법정동의 코드가 서로 달라서 추가적인 filter처리가 필요합니다.
                    items = items.filter(item => item.ldongCd === originCode.slice(0, 8) + "00");
                }
                storeCnt += items.length;
                if (storeCnt < 5) {
                    getStoreList(divId, key, pageNo + 1, index, originCode);    // page를 증가시키며 데이터를 계속 호출합니다.
                } else if (storeCnt > 5) {
                    makeStoreList(items.slice(0, storeCnt - 5));
                    $("#store-progress").empty();
                } else {
                    makeStoreList(items);
                    $("#store-progress").empty();
                }
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
                $("#store-progress").empty();
            }
        },
        error: (err) => { console.log("eerror") },
    })
}

// 상가 정보를 출력하는 함수입니다.
function makeStoreList(data) {
    let storeList = ``;
    data.forEach(element => {
        let rdAddrWithZipcd = `${element.rdnmAdr} (${element.newZipcd})`;
        storeList += `
            <div class="swiper-slide">
                <div class="testimonial-item">
                <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    <h2>${element.bizesNm}</h2>
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                </p>
                <h3 class="mt-5">${rdAddrWithZipcd}</h3>
                <h4 class="mt-2">(${element.lnoAdr})</h4>
                </div>
        </div>
        `;
    });

    $("#store-list").append(storeList);
}