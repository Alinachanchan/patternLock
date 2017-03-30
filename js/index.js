(function() {
	var canvas = document.getElementById('mycanvas');
	var ctx = canvas.getContext('2d');

	var row = 3,
		col = 3;

	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	var size = canvasWidth / 3;

	var minLength = 4; //密码最小长度

	var flagObj = {}; //记录1-9号是否被访问过
	var traceArr = []; //记录当前正在输入的手势密码路径

	var state = "set"; //set again success check
	var traceArr2 = []; //记录第一次设置的手势密码  用于后序验证

	var UI = {
		//绘制九宫圆
		draw: function draw() {
			ctx.save();
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#B0C4DE"
			for(var i = 0; i < row; i++) {
				for(var j = 0; j < col; j++) {
					ctx.beginPath();
					ctx.arc(j * size + 0.5 * size, i * size + 0.5 * size, 30, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
					ctx.closePath();
				}
			}
			ctx.restore();
		},
		//将一个点的样式设为已访问过
		trace: function trace(index) { //index的取值为[1-9]
			//根据index找到圆心坐标
			var indexPosi = calculate.getPosi(index);
			ctx.save();
			ctx.beginPath();
			ctx.arc(indexPosi.x, indexPosi.y, 30, 0, 2 * Math.PI);
			ctx.fillStyle = "#1E90FF";
			ctx.fill();
			ctx.closePath();
			ctx.restore();

			//画线
			if(traceArr.length != 0) {
				var lastIndex = traceArr[traceArr.length - 1];
				var lastPosi = calculate.getPosi(lastIndex);
				ctx.moveTo(lastPosi.x, lastPosi.y);
				ctx.lineTo(indexPosi.x, indexPosi.y);
				ctx.strokeStyle = "#5F9EA0";
				ctx.stroke();
			}
		},
		showInfo: function showInfo(info) {
			document.getElementById("info").innerText = info;
		}
	}

	//重置
	function reset() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		UI.draw();
		traceArr.length = 0;
		flagObj = {};
	}

	//鼠标移动处理函数     输入手势密码
	function hander(e) {
		console.log("ing")
		 var tou = e.targetTouches[ 0 ];
//		 console.log(tou);
		var index = calculate.getIndex(tou.pageX-15, tou.pageY);
		if(index) {
			if(!flagObj[index]) {
				UI.trace(index);
				flagObj[index] = true;
				traceArr.push(index);
			}

//			console.log(traceArr);
		}
	}

	var calculate = {
		//根据index计算小圆的坐标
		getPosi: function getPosi(index) { //index的取值为[1-9]
			index--;
			var x = index % 3;
			var y = Math.floor(index / 3);
			return {
				x: x * size + 0.5 * size,
				y: y * size + 0.5 * size
			}
		},

		//根据坐标算出当前圆的索引
		getIndex: function getIndex(x, y) {
			var j = Math.floor(x / size);
			var i = Math.floor(y / size);

			var mj = x % size;
			var mi = y % size;

			if(mj > 0.2 * size && mj < 0.8 * size && mi > 0.2 * size && mi < 0.8 * size) {
				return i * col + j + 1; //[1-9]
			}
			return 0;
		}
	}

	var lockModel = {
		saveLock: function saveLock(arr) {
			localStorage.setItem("lock", arr); //arr自动转化成字符串
		},
		checkLock: function checkLock(arr) {
			var lockstr = localStorage.getItem("lock");
			return arr.join(",") == lockstr;
		},
		hasSetLock: function hasSetLock() {
			return localStorage.getItem("lock") != null;
		}
	}

	window.onload = function() {
		UI.draw();
		canvas.addEventListener("touchstart",function(e){
			console.log("mousedown");
			traceArr.length = 0;
			hander(e);
			canvas.addEventListener("touchmove",hander,false); 
		},false);
		
//		canvas.ontouchstart = function(e) {
//			
//			console.log("mousedown");
//			traceArr.length = 0;
//			canvas.ontouchmove = function(e) {
//              var touch = e.targetTouches[ 0 ];
//				hander(touch);
//			}
//		}
       canvas.addEventListener("touchend",function(e){
       	console.log("mouseup");
//			canvas.ontouchmove = null;
            canvas.removeEventListener("mousemove",hander,false);
			if(state == "set") {
				if(traceArr.length < minLength) {
					UI.showInfo("长度不能小于" + minLength);

				} else {
					traceArr2.length = 0;
					for(var i = 0; i < traceArr.length; i++) {
						traceArr2[i] = traceArr[i];
					}
					state = "again"
					UI.showInfo("请再输一次");
				}

			} else if(state == "again") {
				if(traceArr.toString() == traceArr2.toString()) {
					state = "success";
					lockModel.saveLock(traceArr);
					UI.showInfo("设置成功");
				} else {
					state = "set";
					UI.showInfo("两次输入不正确，请重新输入");
				}
			} else if(state == "check") {
				if(lockModel.checkLock(traceArr)) {
					UI.showInfo("密码正确    验证通过");
				} else {
					UI.showInfo("密码不正确  请重新验证");
				}
			}
			reset();
       },false);
//		canvas.ontouchend = function(e) {
//			console.log("mouseup");
//			canvas.ontouchmove = null;
//
//			if(state == "set") {
//				if(traceArr.length < minLength) {
//					UI.showInfo("长度不能小于" + minLength);
//
//				} else {
//					traceArr2.length = 0;
//					for(var i = 0; i < traceArr.length; i++) {
//						traceArr2[i] = traceArr[i];
//					}
//					state = "again"
//					UI.showInfo("请再输一次");
//				}
//
//			} else if(state == "again") {
//				if(traceArr.toString() == traceArr2.toString()) {
//					state = "success";
//					lockModel.saveLock(traceArr);
//					UI.showInfo("设置成功");
//				} else {
//					state = "set";
//					UI.showInfo("两次输入不正确，请重新输入");
//				}
//			} else if(state == "check") {
//				if(lockModel.checkLock(traceArr)) {
//					UI.showInfo("密码正确    验证通过");
//				} else {
//					UI.showInfo("密码不正确  请重新验证");
//				}
//			}
//			reset();
//		}
		var btn_set = document.getElementById("setLock");
		var btn_check = document.getElementById("checkLock");

		btn_check.onclick = function(e) {
			state = "check";
			if(!lockModel.hasSetLock()) {
				UI.showInfo("您还没有设置手势密码，请先设置");
				return false;
			}
		}
		btn_set.onclick = function(e) {
			state = "set";
			UI.showInfo("请设置手势密码");
		}
	}
	document.body.addEventListener('touchmove',function(event){

       event.preventDefault();

},false);
})();