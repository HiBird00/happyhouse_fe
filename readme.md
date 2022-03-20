<h1>Happy House</h1>

# 1.메인화면<br>

**메인화면입니다. 맨 상단의 카테고리에 해당하는 구역을 누르면 그 구역으로 스크롤이 이동하도록 구현하였습니다**.<br>
**아직 로그인을 하지 않은 상태이므로 왼쪽 상단의 회원정보를 클릭하면 '로그인해주시기바랍니다' 라는 문구가 뜹니다.**<br>
<br>
<img width="1519" alt="1" src="https://user-images.githubusercontent.com/48594896/159166573-3fe9fdf3-c17c-48e7-be4c-85b2c7aacb59.png">

<br>
<br>

# 2. 아이디 등록하기 && 로그인하기<br>

**id, password, 이름, 주소를 입력하여 로컬스토리지에 user로 저장하였습니다**.<br>
**등록이 완료되면 '사용자등록완료'라는 alert창이 뜹니다.**<br>
**등록된 id와 password로 로그인을하면 그 값이 로컬스토리지에 있는 값이면 로그인을 아니면 실패를 하도록 구현하였습니다.**<br>
**로그인시, 메인메뉴의 "어디로가고싶으세요?"의 메세지가 사용자가 등록한 이름과 함께 환영메세지로 바뀝니다.**<br>
**또한 왼쪽 상단의 회원정보가 MY PROFILE 과 SIGN OUT을 할 수 있는 토글형식의 메뉴로 바뀝니다.**<br>

<br>
<img width="1450" alt="2" src="https://user-images.githubusercontent.com/48594896/159166582-b17aa0a9-e71c-42c3-87be-8f249771cce7.png">
<img width="1358" alt="3" src="https://user-images.githubusercontent.com/48594896/159166588-8a7a10cd-c08a-4721-827b-4fbeece214fa.png">
<img width="1346" alt="4" src="https://user-images.githubusercontent.com/48594896/159166594-7064cb4b-0acd-4c34-9d88-cd4c2a19de8e.png">
<img width="1524" alt="5" src="https://user-images.githubusercontent.com/48594896/159166601-41766c6b-a5ec-435f-bbc8-f3cc70b2339f.png">

<br>
<br>

# 3. 회원정보 수정하기&&탈퇴하기<br>

**MY PROFILE을 누르면 회원정보를 볼 수 있습니다. EDIT MY INFO를 누르면 해당 input값을 수정 할 수 있도록 reset되고**<br>
**CONFIRM을 누르면 수정한 정보값이 로컬스토리지에 있는 user로 다시 저장됩니다.**<br>
**DELETE MY ACCOUNT는 로컬스토리지의 user의 정보 값을 삭제해준 후, login을 false로 만들어주고 메인화면으로 넘어갑니다.**<br>

<br>
<img width="1296" alt="6" src="https://user-images.githubusercontent.com/48594896/159166605-94bf61ca-d06e-40f2-acbd-66c003f89f5c.png">
<img width="1238" alt="7" src="https://user-images.githubusercontent.com/48594896/159166606-ef1940df-cce4-4d5e-933a-875327b00037.png">
<img width="1436" alt="8" src="https://user-images.githubusercontent.com/48594896/159166609-73bf4530-6777-4223-9c8b-1b15edbc3a2a.png">
<img width="1309" alt="9" src="https://user-images.githubusercontent.com/48594896/159166614-70169f42-8667-4a76-aa6e-839d6d105174.png">

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
<img width="1569" alt="10" src="https://user-images.githubusercontent.com/48594896/159166619-5ab0d5c4-f1ba-4ce3-a650-2a13a7dde151.png">
<br>
<img width="936" alt="11" src="https://user-images.githubusercontent.com/48594896/159166620-b5100d23-0d66-4eab-b227-74d321589423.png">
<br>
<img width="1495" alt="12" src="https://user-images.githubusercontent.com/48594896/159166621-c5ec3984-da8c-4c17-9dc6-c87d87b85fb4.png">
<br>
![13](https://user-images.githubusercontent.com/48594896/159166706-f36e6b8a-9727-451e-a52a-68728875015b.png)
<br>
![14](https://user-images.githubusercontent.com/48594896/159166708-5a41781c-b1cd-4da3-b129-a0426af1b043.png)
<br>
![15](https://user-images.githubusercontent.com/48594896/159166709-9bf53da9-578c-4265-a35f-c225492feeeb.png)

<br>
<br>

# 5. 주택실거래가 정보 && 주변상권정보<br>

**공공데이터에서 가져온 '주택실거래가정보'를 보여줍니다. 시/도 시/구/군 동 리 그리고 년도와 월을 선택해야지만 검색할 수 있습니다.**<br>
**검색한 내용을 하단 테이블에 출력하도록구현하였습니다.** <br>
**'주변상권정보'도 똑같은 selector에서 값을 가져와 리스트 카드형식으로 출력해 줍니다.**<br>

<br>
<img width="1475" alt="16" src="https://user-images.githubusercontent.com/48594896/159166627-f61444a0-7cb6-45ea-8c5f-70f72fb89e8f.png">
<br>
<img width="1565" alt="17" src="https://user-images.githubusercontent.com/48594896/159166629-2f65deea-c55b-4cd5-b1dc-3ccf2cc44d59.png">

<br>
<br>

# 6. 아파트와 상권 그리고 cctv<br>

**카카오 지도맵을 보여줍니다. 주택실거래가 정보와 같은 selector를 하나 더 만들어서 해당하는 데이터를**<br>
**지도에 아이콘으로 띄워주도록 하였습니다. 혼선을 막기 위해 아파트, 상권, cctv 아이콘을 지도 왼쪽 상단에 배치하여**<br>
**각각 클릭 시, 지도에 나타나도록 하였습니다.**<br>
- 세 항목 모두 시/구가 반드시 선택되어야 합니다.

<br>

![18](https://user-images.githubusercontent.com/48594896/159166630-dc093b62-2bb9-4d6d-b726-f653bb2220ea.png)
<br>
![19](https://user-images.githubusercontent.com/48594896/159166632-46bf67a0-13b2-4269-9180-0ac8276c0c91.png)
<br>
![20](https://user-images.githubusercontent.com/48594896/159166634-cf57039a-a705-45e5-aeea-f5fe4b9c1ca5.png)

<br>
<br>

# 7. 신속항원검사/PCR 검사 가능 병원 조회<br>

**이 또한 마찬가지로 데이터를 불러와 지도에 띄워주었습니다. 다만 다른점은 selector를 선택하지않고**<br>
**한꺼번에 모든 병원을 지도에 띄우도록 하였습니다. 지도를 줄일경우 클러스터 형식으로 나타나고 지도를 확대할 경우** <br>
**각각의 위치가 아이콘으로 보여집니다.**<br>
- 데이터 양이 많아 1000씩 2~4페이지에 해당하는 병원 정보를 불러옵니다.<br>
- 데이터를 총 3번에 걸쳐서 호출하기 때문에, 잠시 기다려주세요.<br>
<br>

<img width="1486" alt="21" src="https://user-images.githubusercontent.com/48594896/159166635-c897bc8a-0f88-4be8-aee2-4d323d253760.png">
<br>
<img width="1495" alt="22" src="https://user-images.githubusercontent.com/48594896/159166643-b677fc71-5ebe-4743-9800-e77c20c7ede6.png">
