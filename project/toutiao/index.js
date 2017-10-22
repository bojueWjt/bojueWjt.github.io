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

    if(e.target.parentElement.nodeName.toLowerCase() == 'li') {
      selectedTag = e.path[i];
    }else {
      selectedTag = e.target;
    }

    var selectedTag_svg = selectedTag.getElementsByTagName('path')[0];
    var btm_nav_active = btm_nav.getElementsByClassName('active')[0]
    var btm_nav_active_svg = btm_nav_active.getElementsByTagName('path')[0];

    btm_nav_active.className = '';
    selectedTag.className = 'active';
    btm_nav_active_svg.style.fill = "#707070";
    selectedTag_svg.style.fill = "#8f82bc";
  }
})()
