(function() {
    var checkEnd = {
        name: false,
        classVal: false,
        phone: false,
        note: true
    };
    var getElement = function(id) {
        return document.getElementById(id).value
    };
    var onCheckoutListener = function() {
        var inputs = document.getElementsByTagName("input");
        Array.prototype.forEach.call(inputs, 
        function(i, index, array) {
            if (i.type === "text") {
                i.onblur = function(e) {
                    var input = this;
                    checkout(this)
                }
            }
        })
    };
    onCheckoutListener();
    var showErrorInfo = function(errorInfo, txt) {
        errorInfo.innerHTML = txt;
        errorInfo.style.opacity = 1;
        errorInfo.style.marginTop = -65 + "px"
    };
    var hideErrorInfo = function(errorInfo) {
        errorInfo.style.opacity = 0;
        errorInfo.style.marginTop = -40 + "px"
    };
    var checkout = function(input) {
        var value = input.value,
        flag = true,
        paramName = input.id,
        errorInfo = input.nextSibling.nextSibling;
        if (value === "") {
            if (paramName != "note") {
                flag = false;
                if (paramName === "class") {
                    checkEnd.classVal = flag
                } else {
                    checkEnd[paramName] = flag
                }
                checkoutAll();
                showErrorInfo(errorInfo, "这个不能不填哦！");
                return false
            }
        }
        switch (paramName) {
        case "name":
            if (value.length > 8) {
                showErrorInfo(errorInfo, "请填写真实中文名");
                flag = false
            }
            break;
        case "phone":
            if (! (value.length === 11 || value.length === 6 || value.length === 5)) {
                showErrorInfo(errorInfo, "请填写11位长号或5位、6位短号");
                flag = false
            }
            if (! (/^\d+$/.test(value))) {
                showErrorInfo(errorInfo, "电话号码格式不正确");
                flag = false
            }
            break;
        case "note":
            if (value.length > 100) {
                showErrorInfo(errorInfo, "请不要超过50个字 =͟͟͞͞( •̀д•́)");
                flag = false
            }
            break;
        default:
            break
        }
        console.log("ninico");
        if (flag) {
            hideErrorInfo(errorInfo)
        }
        if (paramName === "class") {
            checkEnd.classVal = flag
        } else {
            checkEnd[paramName] = flag
        }
        checkoutAll();
        return flag
    };
    var checkoutAll = function() {
        var flag = true,
        submitBtn = document.getElementById("submit");
        for (var p in checkEnd) {
            flag *= checkEnd[p]
        }
        if (flag) {
            submitBtn.style.background = "#E87D26";
            submitBtn.addEventListener("click", submit)
        } else {
            submitBtn.style.background = "";
            submitBtn.removeEventListener("click", submit)
        }
    };
    var getForm = function() {
        var name = getElement("name");
        var classVal = getElement("class");
        var phone = getElement("phone");
        var note = getElement("note");
        params = {
            "userName": name,
            "userClass": classVal,
            "phoneNumber": phone,
            "saying": note
        };
        console.log(params);
        return params
    };
    var createUrl = function(obj) {
        var url = "apply.action?";
        for (var p in obj) {
            url += (p + "=" + obj[p] + "&")
        }
        url = url.slice(0, -1);
        return url
    };
    var submit = function() {
        var params = getForm();
        var array = createUrl(params).split("?");
        var url = array[0];
        var param = array[1];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                hideShade();
                if (xhr.status == 200) {
                    console.log(xhr.responseText);
                    var data = eval("(" + xhr.responseText + ")");
                    if (data.result) {
                        document.getElementById("page00").style.display = "block";
                        document.getElementById("page01").style.display = "none";
                    } else {
                    	document.getElementById("page00").style.display = "block";
                        document.getElementById("page01").style.display = "none"
                        document.getElementsByClassName("result-info")[0].innerHTML = data.resultInfo;
                        document.getElementById("result-logo").src = "img/iconfont-error.png"
                    }
                } else {
                	document.getElementById("page00").style.display = "block";
                        document.getElementById("page01").style.display = "none";
                    document.getElementsByClassName("result-info")[0].innerHTML = "服务器错误，请稍后再试！^_^||| ";
                    document.getElementById("result-logo").src = "img/iconfont-error.png"
                }
            }
        };
        xhr.open("POST", url, true);

        xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

        showShade();
        xhr.send(param);
        initForm()
    };
    var initForm = function() {
        var inputs = document.getElementsByTagName("input");
        Array.prototype.forEach.call(inputs, 
        function(i, index, array) {
            if (i.type === "text") {
                i.value = ""
            }
            checkEnd = [false, false, false, false];
            checkoutAll()
        })
    };
    var showShade = function() {
        document.getElementsByClassName("shade")[0].style.display = "block"
    };
    var hideShade = function() {
        document.getElementsByClassName("shade")[0].style.display = "none"
    };
    var navListener = function() {
        var navItems = document.getElementsByClassName("nav-item");
        Array.prototype.forEach.call(navItems, 
        function(i, index, array) {
            i.onclick = function(e) {
                for (var i = 0, len = array.length; i < len; i++) {
                    array[i].className = "nav-item"
                }
                array[index].className = array[index].className + " active";
                document.getElementById("page00").style.display = "none";
                document.getElementById("page01").style.display = "none";
                document.getElementById("page02").style.display = "none";
                document.getElementById("page03").style.display = "none";
                document.getElementById("page0" + (index + 1)).style.display = "block"
            }
        })
    };
    navListener();
    document.getElementById("introduces").onclick = function() {
        document.getElementsByClassName("nav-item")[1].click()
    };
    document.getElementById("returnBack").onclick = function() {
        document.getElementsByClassName("nav-item")[0].click()
    }
})();