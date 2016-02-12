(function(){
	/**
	 * [touchEvent 存储触屏滑动事件的信息]
	 * @type {Object}
	 * 
	 */
	var touchEvent = {}

	/**
	 * 绑定滑动事件
	 * @param  {[type]} ev){		touchEvent.startX 开始触摸时X轴坐标
	 *                        		touchEvent.endtX 结束触摸时X轴坐标
	 * 
	 */
	document.addEventListener('touchstart',function(ev){
		ev.preventDefault();
		touchEvent.startX = ev.targetTouches[0].pageX;
	}, false);
	document.addEventListener('touchmove',function(ev){
		ev.preventDefault();
		touchEvent.endX = ev.targetTouches[0].pageX;
	},false);
	document.addEventListener('touchend',function(ev){
		ev.preventDefault();
		if(touchEvent.endX === null){
			return;
		}
		if(touchEvent.endX - touchEvent.startX > 50){
			touchEvent.endX = null;
			touchEvent.startX = null;
			toPerPage();
		}else if(touchEvent.endX - touchEvent.startX < -50){
			touchEvent.endX = null;
			touchEvent.startX = null;
			toNextPage();
		}
	});

	//储存现在页面的对象
	var pages = (function(){
		var num = 0;
		var pageArr = document.getElementsByClassName('page'); 

		return {
			nextPage:function(){
				num++;
				return num;
			},
			perPage:function(){
				num--;
				console.log(num);
				return num;
			},
			getPageNum:function(){
				return num;
			},
			getPageArr:function(){
				return pageArr;
			}
		}
	})();


/**
 * [SImage description]
 * @param {Function} callback [description]
 */
 	var backgroundIsOnload = function(){
		var img=new Image();
		var flag = false;
		img.src="img/p1_bg.png";



		if(img.width==0){
				flag = false;
			}else{
				flag = true;
			}

		return flag;
 	}


	var init = function(){

		var id = setInterval(function(){
			var flag = backgroundIsOnload();

			if(flag){

				document.getElementsByClassName('onload')[0].style.display = 'none';
				var p1 = document.getElementsByClassName('p1')[0];
				p1.id = 'showp' + pages.nextPage();
				new Leaves(5,'showp1');

				clearInterval(id);
			}
		}, 100);
	}


	init();
	

	var toNextpageLisHander = function(){
		    var nextPage = pages.getPageArr()[pages.getPageNum()];
			this.style.display = 'none';
			nextPage.id = "showp" + pages.nextPage();
			this.id = '';
			this.removeEventListener('webkitAnimationEnd', arguments.callee, false);
		}

	var toNextPage = function(){
		if(pages.getPageNum() === pages.getPageArr().length){
			return;
		}

		var nextPage = pages.getPageArr()[pages.getPageNum()],
		nowPage = pages.getPageArr()[pages.getPageNum()-1];

		nextPage.className = 'page p' + (pages.getPageNum()+1)
		nextPage.style.display = 'block'

		nowPage.id = "";
		nowPage.addEventListener("webkitAnimationEnd",toNextpageLisHander,false)
		nowPage.className += ' pageHidden';
		
	}

	var toPerPageLisHander = function(){
		var perPage = pages.getPageArr()[pages.getPageNum()-2];
		this.style.display = 'none';
		perPage.id = "showp" + pages.perPage();
		perPage.className = 'page p' + pages.getPageNum();
		this.id = "";
		perPage.style.display = 'block';
		this.removeEventListener('webkitAnimationEnd', arguments.callee, false);
	}

	var toPerPage = function(){
		if(pages.getPageNum() === 1){
			return;
		}

		var perPage = pages.getPageArr()[pages.getPageNum()-2],
		nowPage = pages.getPageArr()[pages.getPageNum()-1];
		console.log(perPage);

		
		nowPage.addEventListener("webkitAnimationEnd",toPerPageLisHander,false);
		nowPage.className += ' pageHidden';

		
		console.log(perPage.style.display);
	}

})();