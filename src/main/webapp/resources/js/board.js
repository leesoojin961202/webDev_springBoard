'use strict'

//삭제 버튼 클릭 
function clkDel(i_board, typ) {
	if(confirm('삭제 하시겠습니까?')) {
		fetch(`/board/del/${i_board}`, {
			method: 'delete'
		})
		.then(function(res) {			
			return res.json(); // 꼭 리턴해야함
		}).then(function(myJson) {
		    console.log(myJson);

			if(myJson.result === 1) { 
				alert('삭제가 완료되었습니다.');
				location.href = `/board/list?typ=${typ}`;
			} 
			else { 
				alert("삭제 실패하였습니다.");
			}
		});
	}
}

//댓글에서 수정버튼 클릭 
function clkCmtMod(i_cmt) {
	var trForm = document.querySelector('#mod_' + i_cmt);
	trForm.classList.remove('cmd_mod_form');
	console.log(trForm);
}

function clkCmtClose(i_cmt) {
	var trForm = document.querySelector('#mod_' + i_cmt);
	trForm.classList.add('cmd_mod_form');
}

// Ajax통신 사용
// 좋아요 기능 처리(첫번째)
function toggleFavorite (i_board) {
	var fc = document.querySelector('#favoriteContainer');
	var state = fc.getAttribute('is_favorite');  // -> 문자열상태!
	console.log(state); // 좋아요 안누른 상태 -> 0이 나온다(기본값)
	
	var state = 1 - state;
	
	// get 방식으로 통신
	axios.get('/board/ajaxFavorite', {
		params: {
			// state 값이 1이면 좋아요안누름 0이면 좋아요누름 
			'state': state,
			// t_board의 i_board => 게시물 번호(PK)
			'i_board': i_board
		}	
	}).then(function (res) { //통신 성공
		console.log(res);
		
		/*	data:
	      result: 1 - 콘솔창에서 확인완료
		*/
		if(res.data.result == 1) {
			var iconClass = state == 1 ? 'fas' : 'far';
			fc.innerHTML = `<i class="${iconClass} fa-heart"></i>`;
			fc.setAttribute('is_favorite', state)
		} else {
			alert('에러가 발생하였습니다.')
		}
	}).catch(function(err) { //통신 실패
		console.err('err 발생 : ' + err)
	});
}

// 댓글작업 -----------------------------------------------

//모달창 열고 닫기
function openCloseCmtModal(state) {
	var modalWrapElem = document.querySelector('.modal_wrap')
	var blackBgElem = document.querySelector('.black_bg')	
	modalWrapElem.style.display = state
	blackBgElem.style.display = state
}

//댓글 수정
function modCmt(i_cmt, ctnt) {
	openCloseCmtModal('block')
	
	var cmtCtntElem = document.querySelector('#cmtCtnt')
	var cmtModBtn = document.querySelector('#cmtModBtn')
	
	cmtCtntElem.value = ctnt // 최초 댓글 내용
	
	cmtModBtn.onclick = ajax
	
	function ajax() {
		var param = {
			i_cmt,
			ctnt: cmtCtntElem.value,
		}
		
		fetch('/board/updCmt', {
			method: 'PUT',
			headers: {
            	'Content-Type': 'application/json'
			},
			body: JSON.stringify(param) // 객체를 문자열(JSON) 형태로 변환한다
		})
		.then(res => res.json())
		.then(myJson => {
			openCloseCmtModal()
			// 모달창닫기 미완
			console.log(myJson)  // 1이 넘어와야 성공 
			switch(myJson){
				case 0:
					alert('수정실패')
					return
				case 1:
					cmtObj.getCmtList
					return
			}
		})
	}
}

//댓글 삭제
function delCmt(i_cmt) {
	if(!confirm('삭제하시겠습니까?')) {
		return
	}
	
	fetch(`/board/delCmt?i_cmt=${i_cmt}`,{
		method: 'DELETE'
	}).then(function(res) {
		return res.json()
	}).then(function(myJson) {
		switch(myJson.result) {
			case 1:
				cmtObj.getCmtList()
			return
			case 0:
				alert('댓글 삭제 실패')
			return
		}
	})
}

var cmtObj = {
	i_board: 0,
	createCmtTable: function() {
		var tableElem = document.createElement('table')
		tableElem.innerHTML = 
		`<tr>
			<th>내용</th>
			<th>작성자</th>
			<th>작성일</th>
			<th>비고</th>
		</tr>`			
		return tableElem
	},
	
	getCmtList: function() {
		if(this.i_board === 0) {
			return
		}
		fetch(`/board/cmtList?i_board=${this.i_board}`)
			.then(function(res) {
				return res.json()
			})
			.then((list) => {
				cmtListElem.innerHTML = ''
				this.proc(list)
			})
	},
	proc: function(list) {
		if(list.length == 0) {			
			return
		}
		var table = this.createCmtTable()
		for(var i = 0; i < list.length; i++) {
			var recode = this.createRecode(list[i])
			table.append(recode)
		}		
		cmtListElem.append(table)
	},
	createRecode: function(item) {
		var etc = ''
		if(item.is_mycmt === 1) {
			etc = `<button onclick="modCmt(${item.i_cmt}, '${item.ctnt}')">수정</button>
			<button onclick="delCmt(${item.i_cmt})">삭제</button>`
		}
		var tr = document.createElement('tr')
		tr.innerHTML = `
			<td>${item.ctnt}</td>
			<td>${item.user_nm}</td>
			<td>${item.r_dt}</td>
			<td>${etc}</td>`
		return tr
	},	
}

//댓글 리스트
var cmtListElem = document.querySelector('#cmtList')
if(cmtListElem) {
	//모달창 닫기 버튼
	var modalCloseElem = document.querySelector('.modal_close')
	if(modalCloseElem){
		modalCloseElem.addEventListener('click', function() {
		openCloseCmtModal('none')
		})
	}
	var i_board = document.querySelector('#i_board').dataset.id
	cmtObj.i_board = i_board
	cmtObj.getCmtList()
}


//댓글 달기
var cmtFrmElem = document.querySelector('#cmtFrm')
if(cmtFrmElem) {	
	cmtFrmElem.onsubmit = function(e) {
		e.preventDefault()
	}

	var ctntElem = cmtFrmElem.ctnt
	var btnElem = cmtFrmElem.btn	
	var i_board = document.querySelector('#i_board').dataset.id
	cmtObj.i_board = i_board

	ctntElem.onkeyup = function(e) {		
		if(e.keyCode === 13) {
			ajax()
		}
	}	
	btnElem.addEventListener('click', ajax)
		
	function ajax () {		
		if(ctntElem.value === '') {
			return
		}
				
		var param = {
			i_board: i_board,
			ctnt: ctntElem.value
		}
	
		console.log(param)
		fetch('/board/insCmt', {
			method: 'POST',
			headers: {
            	'Content-Type': 'application/json'
			},
			body: JSON.stringify(param) // 객체를 문자열(JSON) 형태로 변환한다
		}).then(function(res) {
			return res.json() // promise 객체 리턴
		}).then(function(data) {
			proc(data)
		})
	}
	
	function proc (data) {
		switch(data.result){
			case 0:
				alert('댓글 작성 실패하였습니다')
			return
			case 1:
				ctntElem.value = ''				
				cmtObj.getCmtList()
			return
		}
	}
}