$(function () {
    var mapContainer = document.getElementById('map'), // 지도를 표시할 div  
        mapOption = {
            center: new kakao.maps.LatLng(37.498004414546934, 127.02770621963765), // 지도의 중심좌표 
            level: 3 // 지도의 확대 레벨 
        };

    map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
    // 마커 클러스터러를 생성합니다 
    clusterer = new kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
        minLevel: 10 // 클러스터 할 최소 지도 레벨 
    });

    // createCarparkMarkers(); // 주차장 마커를 생성하고 주차장 마커 배열에 추가합니다

    changeMarker('apt'); // 지도에 커피숍 마커가 보이도록 설정합니다.

    // 년/월 select box 초기화
    for (let i = new Date().getFullYear(); i >= 2000; i--) {
        $("select[name='year']").append(`<option value=${i}>${i}</option>`);;
    }
    for (let i = 1; i <= 12; i++) {
        $("#contact select[name='month']").append(`
            <option value=${("00" + i).slice(-2)}>${i}</option>
        `);
    }

    $("#contact select[name='year']").val(new Date().getFullYear());
    $("#contact select[name='month']").val(("00" + (new Date().getMonth() + 1)).slice(-2));

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
        let city = $("#contact select[name='city']").val();  // 선택된 시/도
        let gu = $("#contact select[name='gu']").val();      // 선택된 시/군/구
        let dong = $("#contact select[name='dong']").val();  // 선택된 읍/면/동
        let ri = $("#contact select[name='ri']").val();      // 선택된 리
        let year = $("#contact select[name='year']").val();      // 선택된 리
        let month = $("#contact select[name='month']").val();      // 선택된 리
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
            // console.log('code', code, index);
            // 모든 위치, 마커를 초기화 합니다.
            aptPositions = [];
            storePositions = [];
            cctvPositions = [];
            hospitalPositions = [];
            setAptMarkers(null);
            setStoreMarkers(null);
            setCCTVMarkers(null);
            // setAptMarkers(null);
            aptMarkers = [];
            storeMarkers = [];
            cctvMarkers = [];
            hospitalMarkers = [];


            map_getAptList(code.slice(0, 5), code.slice(-5), year + month, 1);    // 아파트 리스트를 출력하기 위해 시/구 코드, 동 코드, 날짜, 페이지 수를 파라미터로 전송합니다.

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
            map_getStoreList(divId, key, 1, index, code);   // 상권 리스트를 출력하기 위해 key에 해당하는 ID(divId)와 페이지 수, 동/리를 예외처리 하기 위한 index, 원래 code를 전송합니다.
            getCCTVList();
        }
    })

    $(document).on("click", "#hospital-search-btn", function () {
        setAptMarkers(null);
        setStoreMarkers(null);
        setCCTVMarkers(null);
        var aptMenu = document.getElementById('aptMenu');
        var storeMenu = document.getElementById('storeMenu');
        var cctvMenu = document.getElementById('cctvMenu');
        aptMenu.className = '';
        storeMenu.className = '';
        cctvMenu.className = '';
        getHospital(2);
    })
})

var map, clusterer;

var aptPositions = [];  // 아파트 마커 배열
var storePositions = [];
var cctvPositions = []; // cctv 마커 배열
var hospitalPositions = []; // 호흡기 의원 마커 배열

var storeMarkers = [],
    aptMarkers = [], // 아파트 마커 객체를 가지고 있을 배열입니다
    cctvMarkers = [], // cctv 마커 객체를 가지고 있을 배열입니다
    hospitalMarkers = []; // 호흡기 의원 마커 객체를 가지고 있을 배열입니다

// 마커이미지의 주소와, 크기, 옵션으로 마커 이미지를 생성하여 리턴하는 함수입니다
function createMarkerImage(src, size, options) {
    var markerImage = new kakao.maps.MarkerImage(src, size, options);
    return markerImage;
}

// 좌표와 마커이미지를 받아 마커를 생성하여 리턴하는 함수입니다
function createMarker(position, image) {
    var marker = new kakao.maps.Marker({
        position: position,
        image: image,
        clickable: true
    });

    return marker;
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow) {
    return function () {
        infowindow.open(map, marker);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function () {
        infowindow.close();
    };
}

function makeMarkerClickListener(map, marker, address) {
    $("#map-detail-location").text(address);
    infowindow.open(map, marker);
}

// 아파트 마커를 생성하고 커피숍 마커 배열에 추가하는 함수입니다
function createAptMarkers() {
    for (let i = 0; i < aptPositions.length; i++) {
        // 주소-좌표 변환 객체를 생성합니다
        var geocoder = new kakao.maps.services.Geocoder();

        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(aptPositions[i]?.addr, function (result, status) {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                var imageSize = new kakao.maps.Size(40, 40),
                    imageOptions = {
                        offset: new kakao.maps.Point(27, 69)
                    };

                // 마커이미지와 마커를 생성합니다
                var markerImage = createMarkerImage("img2/map/apt.png", imageSize, imageOptions),
                    marker = createMarker(coords, markerImage);

                // 생성된 마커를 아파트 마커 배열에 추가합니다
                aptMarkers.push(marker);
            }
        });
    }
}

// 아파트 마커들의 지도 표시 여부를 설정하는 함수입니다
function setAptMarkers(map) {
    aptMarkers.forEach(function (marker, idx) {
        marker.setMap(map);

        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: `<div>${aptPositions[idx]?.name}</div>`,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            $("#map-detail-location").text(aptPositions[idx]?.addr);
            infowindow.open(map, marker);
        });

    })

    if (aptMarkers[0]) {
        let mPos = aptMarkers[0].getPosition();
        map?.setCenter(new kakao.maps.LatLng(mPos.Ma, mPos.La));

    }
}

// 상가 마커를 생성하고 커피숍 마커 배열에 추가하는 함수입니다
function createStoreMarkers() {
    for (var i = 0; i < storePositions.length; i++) {
        let pos = new kakao.maps.LatLng(storePositions[i]?.lat, storePositions[i]?.lon);

        var imageSize = new kakao.maps.Size(40, 40),
            imageOptions = {
                offset: new kakao.maps.Point(27, 69)
            };

        // 마커이미지와 마커를 생성합니다
        var markerImage = createMarkerImage("img2/map/store.png", imageSize, imageOptions),
            marker = createMarker(pos, markerImage);

        // 생성된 마커를 커피숍 마커 배열에 추가합니다
        storeMarkers.push(marker);
    }
}

// 상가 마커들의 지도 표시 여부를 설정하는 함수입니다
function setStoreMarkers(map) {
    let moved = false;
    storeMarkers.forEach(function (marker, idx) {
        marker.setMap(map);
        // if (!moved) {
        //     let mPos = marker.getPosition();
        //     map.setCenter(new kakao.maps.LatLng(mPos.Ma, mPos.La));
        //     moved = true;
        // }
        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: `<div>${storePositions[idx]?.name}</div>`,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            $("#map-detail-location").text(storePositions[idx]?.rdAddr);
            infowindow.open(map, marker);
        });
    })

    if (storeMarkers[0]) {
        let mPos = storeMarkers[0].getPosition();
        map?.setCenter(new kakao.maps.LatLng(mPos.Ma, mPos.La));

    }
}


// FIXME : cctv 마커
function createCCTVMarkers() {
    for (var i = 0; i < cctvPositions.length; i++) {
        let pos = new kakao.maps.LatLng(cctvPositions[i]?.lat, cctvPositions[i]?.lon);

        var imageSize = new kakao.maps.Size(40, 40),
            imageOptions = {
                offset: new kakao.maps.Point(27, 69)
            };

        // 마커이미지와 마커를 생성합니다
        var markerImage = createMarkerImage("img2/map/cctv.png", imageSize, imageOptions),
            marker = createMarker(pos, markerImage);

        // 생성된 마커를 커피숍 마커 배열에 추가합니다
        cctvMarkers.push(marker);
    }
}

// 상가 마커들의 지도 표시 여부를 설정하는 함수입니다
function setCCTVMarkers(map) {
    cctvMarkers.forEach(function (marker, idx) {
        marker.setMap(map);

        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: `<div>${cctvPositions[idx]?.cctvuse}</div>`,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            $("#map-detail-location").text(cctvPositions[idx]?.addr);
            infowindow.open(map, marker);
        });
    })

    if (cctvMarkers[0]) {
        let mPos = cctvMarkers[0].getPosition();
        map?.setCenter(new kakao.maps.LatLng(mPos.Ma, mPos.La));

    }
}


// 카테고리를 클릭했을 때 type에 따라 카테고리의 스타일과 지도에 표시되는 마커를 변경합니다
function changeMarker(type) {
    var aptMenu = document.getElementById('aptMenu');
    var storeMenu = document.getElementById('storeMenu');
    var cctvMenu = document.getElementById('cctvMenu');

    if (type === 'apt') { // 편의점 카테고리가 클릭됐을 때

        // 편의점 카테고리를 선택된 스타일로 변경하고
        aptMenu.className = 'menu_selected';
        storeMenu.className = '';
        cctvMenu.className = '';

        // 편의점 마커들만 지도에 표시하도록 설정합니다
        setAptMarkers(map);
        setStoreMarkers(null);
        setCCTVMarkers(null);
    } else if (type === 'store') { // 상권 카테고리가 클릭됐을 때

        // 상권 카테고리를 선택된 스타일로 변경하고
        aptMenu.className = '';
        storeMenu.className = 'menu_selected';
        cctvMenu.className = '';

        // 주차장 마커들만 지도에 표시하도록 설정합니다
        setAptMarkers(null);
        setStoreMarkers(map);
        setCCTVMarkers(null);
    } else if (type === 'cctv') { // cctv 카테고리가 클릭됐을 때

        // 주차장 카테고리를 선택된 스타일로 변경하고
        aptMenu.className = '';
        storeMenu.className = '';
        cctvMenu.className = 'menu_selected';

        // 주차장 마커들만 지도에 표시하도록 설정합니다
        setAptMarkers(null);
        setStoreMarkers(null);
        setCCTVMarkers(map);
    }
    clusterer.clear();
}


// 주소 코드를 통해 주소를 불러오는 함수입니다.
// function getJusoByCode(data, name) {
//     $.ajax({
//         url: "https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes",
//         type: "GET",
//         data,
//         dataType: "json",
//         success: (res => {
//             console.log(res);
//             printToSelect(name, res?.regcodes ? res.regcodes : []); // select에 주소를 출력합니다. 만약, 데이터가 없으면 빈 array를 전송합니다.
//         })
//     })
// }


// // select에 주소를 출력하는 함수입니다.
// function printToSelect(name, response) {
//     let selectInfo = ``;
//     response.forEach(element => {
//         let eName = element.name;
//         let spt = eName.split(" ");
//         if (name === 'gu') {
//             eName = spt.slice(1).join(" "); // 시/군/구인 경우 맨 첫 index가 가지는 시/도를 제외하고 불러옵니다. (수원시, 성남시는 구까지 포함)
//         } else {
//             if (name === 'dong') {
//                 if (element.code.slice(-2) !== "00") return; // 만약 읍/면/동을 출력하려는데, 리까지 포함되어있는 옵션이라면 출력하지 않습니다. (ex. 가평읍)
//             } else if (name === 'ri') {
//                 if (element.code.slice(-2) == '00') return; // 리를 출력하려는데 리가 포함되어있지 않다면 출력하지 않습니다.
//             }
//             eName = spt[spt.length - 1];
//         }
//         selectInfo += `
//             <option value=${element.code}>${eName}</option>
//         `;
//     });
//     let option = $(`select[name=${name}] > option:first`)[0];
//     $(`select[name=${name}]`).empty().append(option).append(selectInfo);
// }

function map_getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo) {
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
                map_makeList(items, DONG_CD);
                map_getAptList(LAWD_CD, DONG_CD, DEAL_YMD, pageNo + 1)  // page를 증가시키며 데이터를 계속 호출합니다.
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
            }
        },
        error: () => { },
    });
}


// 아파트 리스트를 출력하는 함수입니다.
function map_makeList(data, DONG_CD) {
    data.each(function () {
        if (DONG_CD != "00000" && $(this).find("법정동읍면동코드").text() !== DONG_CD) return true;     // 구 코드까지만 호출한 데이터이므로, 동에 대한 예외처리를 해줍니다.
        let city = $("select[name='city'] option:checked").text();  // 선택된 시/도
        let gu = $("select[name='gu'] option:checked").text();      // 선택된 시/군/구
        let addr = `${city} ${gu} ${$(this).find("도로명").text()} ${$(this).find("지번").text()}`;

        aptPositions.push({
            name: $(this).find("아파트").text(),
            floor: $(this).find("층").text(),
            area: $(this).find("전용면적").text(),
            price: $(this).find("거래금액").text(),
            addr
        });
    });
    createAptMarkers(); // 아파트 마커를 생성하고 편의점 마커 배열에 추가합니다
    //changeMarker('apt'); //아파트 마커를 지도에 출력합니다.
}


/*****************  상가 정보  *****************/
// 상가정보를 얻는 함수입니다.
function map_getStoreList(divId, key, pageNo, index, originCode) {
    let requestData = {
        serviceKey: "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==",
        pageNo,
        numOfRows: "500",
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
                map_makeStoreList(items);
                // map_getStoreList(divId, key, pageNo + 1, index, originCode);    // page를 증가시키며 데이터를 계속 호출합니다.
            } else {
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
                //changeMarker('store'); // 상권 마커를 지도에 출력합니다.
            }
        },
        error: (err) => { console.log("eerror") },
    })
}

// 상가 정보를 출력하는 함수입니다.
function map_makeStoreList(data) {
    data.forEach(element => {
        storePositions.push({
            name: element.bizesNm,
            category: element.indsMclsNm,
            addr: element.lnoAdr,
            rdAddr: element.rdnmAdr,
            zipcd: element.newZipcd,
            lon: element.lon,
            lat: element.lat
        });
    });
    // console.log(storePositions/)
    createStoreMarkers(); // 상권 마커를 생성하고 편의점 마커 배열에 추가합니다
}



/*****************  CCTV  *****************/
const seoulKey = "4955426858776e68363059744f7875";  // 서울 광장 데이터 api 키

// cctv 정보를 얻어오는 함수입니다.
function getCCTVList() {
    let startIdx = 1;
    let endIdx = 30;
    let gu = $("#contact select[name='gu'] option:checked").text();  // 선택된 구
    let url = `http://openapi.seoul.go.kr:8088/${seoulKey}/json/safeOpenCCTV/${startIdx}/${endIdx}/${gu}`;
    $.ajax({
        url,
        type: "GET",
        dataType: "json",
        success: (response) => {
            if (response.safeOpenCCTV.row.length) {
                makeCCTVList(response.safeOpenCCTV.row);
            }
        }
    })
}

function makeCCTVList(data) {
    data.forEach(ele => {
        cctvPositions.push({
            addr: ele.ADDR,
            cctvuse: ele.CCTVUSE,
            gu: ele.SVCAREAID,
            update: ele.UPDTDATE,
            lat: ele.WGSXPT,
            lon: ele.WGSYPT
        })
    })

    createCCTVMarkers(); // cctv 마커를 생성하고 편의점 마커 배열에 추가합니다
    //  changeMarker('cctv'); // cctv 마커를 지도에 출력합니다.
}


/*****************  선별진료소 / 안심병원  *****************/
function getHospital(pageNo) {
    let ServiceKey = "+sjo5YZ5yUmsPnmqL8EY2DoNkNxNY/n6fEgghhG8zsvw2pVDPBANrAr8MAJNQtYesL6tZtITX06tHL5EmvMxIw==";
    let requestData = {
        ServiceKey,
        pageNo,
        numOfRows: 1000
    };
    $.ajax({
        url: "http://apis.data.go.kr/B551182/rprtHospService/getRprtHospService",
        type: "GET",
        data: requestData,
        dataType: "xml",
        success: (response) => {
            let items = $(response).find("item");
            if (items?.length) {
                // 데이터가 있으면 출력
                makeHospitalList(items);
                if (pageNo < 4) {
                    getHospital(pageNo + 1);
                }
            } else {
                console.log("end")
                // 데이터가 없으면(pageNo이 초과했으면) 그만 호출합니다.
                //changeMarker('store'); // 상권 마커를 지도에 출력합니다.
            }
        }
    })
}

function makeHospitalList(data) {
    let hospitals = [];
    // 데이터를 가져오기 위해 jQuery를 사용합니다
    // 데이터를 가져와 마커를 생성하고 클러스터러 객체에 넘겨줍니다
    var markers = data.map(function (i, position) {
        hospitals.push({
            name: $(position).find("yadmNm").text(),
            addr: $(position).find("addr").text(),
            pcr: $(position).find("pcrPsblYn").text(),
            rat: $(position).find("ratPsblYn").text()
        });
        return new kakao.maps.Marker({
            position: new kakao.maps.LatLng($(position).find("YPosWgs84").text(), $(position).find("XPosWgs84").text())
        });
    });
    // 클러스터러에 마커들을 추가합니다
    clusterer.addMarkers(markers);

    // 마커에 표시할 인포윈도우를 생성합니다 
    markers.each(function (idx, marker) {
        var infowindow = new kakao.maps.InfoWindow({
            content: `<div>
                <div>${hospitals[idx]?.name}</div>
                <div>
                    <span>PCR검사 : ${hospitals[idx]?.pcr}</span>
                    <span>신속항원검사 : ${hospitals[idx]?.rat}</span>
                </div>
            </div>`,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            $("#map-detail-location").text(hospitals[idx]?.addr);
            infowindow.open(map, marker);
        });
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

