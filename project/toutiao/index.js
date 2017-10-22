(function() {

  var top_menu_list = document.getElementsByClassName("top_menu_list")[0];

  top_menu_list.onclick = function(e) {
    var selectedTag = e.target;
    var top_menu_active = top_menu_list.getElementsByClassName("active")[0];
    top_menu_active.className = '';
    selectedTag.className = 'active';
  }

  var btm_nav = document.getElementsByClassName('bottom_nav_bar')[0];

  btm_nav.onclick = function(e) {
    var selectedTag;
    console.log(e.path);
    var i = 0;

    for(var i = 0, len = e.path.length - 1; i < len; i++) {

      if(e.path[i].nodeName.toLowerCase() == 'li') {
        selectedTag = e.path[i];
      }
    }

    if(selectedTag === undefined) {

      return;
    }

    var selectedTag_svg = selectedTag.getElementsByTagName('path')[0];
    var btm_nav_active = btm_nav.getElementsByClassName('active')[0]
    var btm_nav_active_svg = btm_nav_active.getElementsByTagName('path')[0];

    btm_nav_active.className = '';
    selectedTag.className = 'active';
    btm_nav_active_svg.style.fill = "#707070";
    selectedTag_svg.style.fill = "#8f82bc";
  }

//  修改viewport

  var viewport = document.querySelector("meta[name=viewport]");
  var winWidths= window.innerWidth;
  var densityDpi=640/winWidths;
      densityDpi= densityDpi>1?300*640*densityDpi/640:densityDpi;
  if(isWeixin()){
      viewport.setAttribute('content', 'width=640, target-densityDpi='+densityDpi);
  }else{
      viewport.setAttribute('content', 'width=640, user-scalable=no');
      window.setTimeout(function(){
          viewport.setAttribute('content', 'width=640, user-scalable=yes');
      },1000);
  }
  function isWeixin(){
      var ua = navigator.userAgent.toLowerCase();
      if(ua.match(/MicroMessenger/i)=="micromessenger") {
          return true;
      } else {
          return false;
      }
  }
})()
