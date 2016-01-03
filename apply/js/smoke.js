/**
* 这是一个制造雪花的函数
* ＊＊*＊＊＊*＊＊＊*＊＊*＊
*＊*＊＊＊＊*＊*＊**＊＊*＊＊＊*＊
**＊＊＊*＊＊＊＊＊*＊*＊*＊
**＊*＊＊*＊*＊＊*＊＊＊＊*＊
**＊*＊＊＊*＊*＊＊＊＊＊＊
*  好了玩够了( ' – ' )
*
* 纯手打 版权©所有伯爵科技
*
* author:ninico
*/

(function(){

	var canvas = document.getElementById("logo");
	var ctx = canvas.getContext("2d");
	var canvasWidth = window.innerWidth;
	var canvasHeight = canvas.height;
	var logoUrl = "img/logo.png"
	var logoImg = document.createElement("img");
	var smokeImg = document.createElement("img");
	var backgroundImg = document.createElement("img");
	var backgroundUrl = "img/background.jpg"
	var smokeUrl = "img/ParticleSmoke.png";
	var smokeNum = 180;
	var smokes = [];

	smokeImg.src = smokeUrl;
	logoImg.src = logoUrl;
	backgroundImg.src = backgroundUrl;



	canvas.width = canvasWidth;

	var initCanvas = function(){

		for(var i = 0; i < smokeNum ; i++){

			var smokeObj = new Smoke();
			smokeObj.init();


			smokes.push(smokeObj);
		}

		gameLoop();
	}

	var gameLoop = function(){

		setTimeout(arguments.callee,100);
		drawBackground();
	}

	var drawBackground = function(){


		ctx.fillStyle = "#f9f2d6";
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		ctx.drawImage(backgroundImg,(600-canvasWidth)/2,0,canvasWidth,canvasHeight,0,0,canvasWidth,canvasHeight);
		ctx.drawImage(logoImg,10,10,283,50);

		ctx.fillStyle = "#fff";
		ctx.font = "15px Microsoft YaHei";
		ctx.fillText("比技术，我们就没怕过谁。",30,80);

		drawSmoke();

	}

	var drawSmoke = function(){

		for(var i = 0,len = smokes.length; i < len ; i++){

			smokes[i].drawSelf();
			smokes[i].update();
		}
	}

	var Smoke = function(){
		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.xSpd = 0;
		this.ySpd = 0;
	}

    Smoke.prototype = {
		constructor:Smoke,
		init:function(){

			var flag = Math.random()*1 > 0.3?1:-1;
			var z = Distribution();
			var ySpd = z;

			if(z>22){

				ySpd *= 5;
			}else if(z>14){
				ySpd *=3;
			}

			this.x = Math.random()*canvasWidth;
			this.y = -Math.random()*canvasHeight;
			this.z = z;
			this.xSpd = flag*Math.random()*3;
			this.ySpd = ySpd;
			this.zSpd = 0;
		},
		drawSelf:function(){

			ctx.drawImage(smokeImg,this.x,this.y,this.z,this.z)
		},
		update:function(){

			this.x += this.xSpd;
			this.y += this.ySpd*0.2;
			this.z += this.zSpd;

			if(Math.abs(this.x) >= canvasWidth + 50 || Math.abs(this.y) >= canvasHeight + 50){
				this.init();
			}

			if(this.z > 30 || this.z < 0){

				this.zSpd = -this.zSpd;
			}

		}

	}

	var Distribution = function(){

		var flag = Math.random();

		if(flag < 0.05){

			return Math.random()*7 + 30;
		}else if(flag < 0.7){
			return Math.random()*7 + 6;
		}else if(flag < 0.9){
			return Math.random()*7 + 14;
		}else{
			return Math.random()*7 + 0;
		}
		
	}

	initCanvas();

})();