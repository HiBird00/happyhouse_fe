<h1>Happy House</h1>

# 1.메인화면<br>

**메인화면입니다. 맨 상단의 카테고리에 해당하는 구역을 누르면 그 구역으로 스크롤이 이동하도록 구현하였습니다**.<br>
**아직 로그인을 하지 않은 상태이므로 왼쪽 상단의 회원정보를 클릭하면 '로그인해주시기바랍니다' 라는 문구가 뜹니다.**<br>
<br>
![MAIN1](/uploads/dde45592872f64461e37c0729aebe503/MAIN1.png)

<br>
<br>

# 2. 아이디 등록하기 && 로그인하기<br>

**id, password, 이름, 주소를 입력하여 로컬스토리지에 user로 저장하였습니다**.<br>
**등록이 완료되면 '사용자등록완료'라는 alert창이 뜹니다.**<br>
**등록된 id와 password로 로그인을하면 그 값이 로컬스토리지에 있는 값이면 로그인을 아니면 실패를 하도록 구현하였습니다.**<br>
**로그인시, 메인메뉴의 "어디로가고싶으세요?"의 메세지가 사용자가 등록한 이름과 함께 환영메세지로 바뀝니다.**<br>
**또한 왼쪽 상단의 회원정보가 MY PROFILE 과 SIGN OUT을 할 수 있는 토글형식의 메뉴로 바뀝니다.**<br>

<br>
![RESISTER](/uploads/6f365d2466a6d02509bd739e81468d10/RESISTER.png)
![LOGIN_FAIL](/uploads/854a119b7cef59ce94f54fbc5031cfee/LOGIN_FAIL.png)
![LOGIN_SUCCESS](/uploads/959b893b44e5a82283c49a9f10f11922/LOGIN_SUCCESS.png)
![MAIN_AFTER_LOGIN](/uploads/d4e1501a7ac05d069b4450e14b00b9d9/MAIN_AFTER_LOGIN.png)

<br>
<br>

# 3. 회원정보 수정하기&&탈퇴하기<br>

**MY PROFILE을 누르면 회원정보를 볼 수 있습니다. EDIT MY INFO를 누르면 해당 input값을 수정 할 수 있도록 reset되고**<br>
**CONFIRM을 누르면 수정한 정보값이 로컬스토리지에 있는 user로 다시 저장됩니다.**<br>
**DELETE MY ACCOUNT는 로컬스토리지의 user의 정보 값을 삭제해준 후, login을 false로 만들어주고 메인화면으로 넘어갑니다.**<br>

<br>
![회원정보출력](/uploads/126673135e165ac2bee918ea5294fcf8/회원정보출력.png)
![회원정보수정](/uploads/a472bf7843f574205b7deb41b1f5b2f4/회원정보수정.png)
![회원정보변경후](/uploads/934819cc63b498975b70e3f54df6eb23/회원정보변경후.png)
![회원탈퇴](/uploads/813c53b250f7a433574aab9bcd543404/회원탈퇴.png)

<br>
<br>

# 4. 공지사항<br>

**user가 admin아이디를 가지고 있을 때만 공지사항에 글을 쓸 수 있도록 구현하였습니다.**<br>
**글쓰기 버튼을 누르면 창이 하나가 뜨고 그곳에 제목과 내용을 적으면 공지사항 메인 보드에 기록됩니다.**<br>
**관리자인 경우에만 게시글 수정/삭제 버튼이 활성화 됩니다.**<br>
- 관리자 여부는 localStorage의 user.id를 참고해주세요.<br>

**수정 버튼 클릭 시, 글을 수정할 수 있습니다.**<br>
**삭제 버튼 클릭 시, 해당 글을 삭제할 수 있습니다.**<br>

<br>
![공지사항관리자](/uploads/ab4b93dfba4566cc6f7c75702124d6ed/공지사항관리자.png)
<br>
![공지사항글쓰기](/uploads/0798d385034def9af8fe542832302ce3/공지사항글쓰기.png)
<br>
![공지사항등록](/uploads/f103bc83a8ddaf6e9c6d1abf0ef722f2/공지사항등록.png)
<br>
![image](/uploads/5b05d869062cffbb3828d15cbde8b73d/image.png)
<br>
![image](/uploads/60143299dbcb3e6bd4722d2709cda5dc/image.png)
<br>
![image](/uploads/a3c6313baa4454bb7b883968295bafcf/image.png)
<br>
![image](/uploads/5caf3376a106cf6ec4cf7628e3eff297/image.png)

<br>
<br>

# 5. 주택실거래가 정보 && 주변상권정보<br>

**공공데이터에서 가져온 '주택실거래가정보'를 보여줍니다. 시/도 시/구/군 동 리 그리고 년도와 월을 선택해야지만 검색할 수 있습니다.**<br>
**검색한 내용을 하단 테이블에 출력하도록구현하였습니다.** <br>
**'주변상권정보'도 똑같은 selector에서 값을 가져와 리스트 카드형식으로 출력해 줍니다.**<br>

<br>
![주택실거래가정보](/uploads/7aed16e9bf73a361b114bed1034cb101/주택실거래가정보.png)
![주변상가정보](/uploads/94e1840f7e8690b75b078e98163b677b/주변상가정보.png)

<br>
<br>

# 6. 아파트와 상권 그리고 cctv<br>

**카카오 지도맵을 보여줍니다. 주택실거래가 정보와 같은 selector를 하나 더 만들어서 해당하는 데이터를**<br>
**지도에 아이콘으로 띄워주도록 하였습니다. 혼선을 막기 위해 아파트, 상권, cctv 아이콘을 지도 왼쪽 상단에 배치하여**<br>
**각각 클릭 시, 지도에 나타나도록 하였습니다.**<br>
- 세 항목 모두 시/구가 반드시 선택되어야 합니다.

<br>

![MOREINFO_아파트](/uploads/8103be32406fd0096c460ead11554ac1/MOREINFO_아파트.png)
![MOREINFO_상권](/uploads/9a71ad441da9f0c10f01ceb3909847d3/MOREINFO_상권.png)
![MOREINFO_씨씨티비](/uploads/dd8e4a226cfb46ebfd2e8e048122d515/MOREINFO_씨씨티비.png)

<br>
<br>

# 7. 신속항원검사/PCR 검사 가능 병원 조회<br>

**이 또한 마찬가지로 데이터를 불러와 지도에 띄워주었습니다. 다만 다른점은 selector를 선택하지않고**<br>
**한꺼번에 모든 병원을 지도에 띄우도록 하였습니다. 지도를 줄일경우 클러스터 형식으로 나타나고 지도를 확대할 경우** <br>
**각각의 위치가 아이콘으로 보여집니다.**<br>
- 데이터 양이 많아 1000씩 2~4페이지에 해당하는 병원 정보를 불러옵니다.<br>
- 데이터를 총 3번에 걸쳐서 호출하기 때문에, 잠시 기다려주세요.<br>
<br>

![신속항원ZOOMIN](/uploads/d5d259c781dd98add426aa7bb36b37b4/신속항원ZOOMIN.png)
![신속항원ZOOMOUT](/uploads/ae572d1c0f97df2afc48669b2bfad085/신속항원ZOOMOUT.png)
