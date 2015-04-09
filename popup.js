/**
 * 查看数据中是否包含元素
 * @param  {[Obj]} arr [description]
 * @param  {[Obj]} ele [description]
 * @return {[boolean]}     [description]
 */
function arrContain(arr, ele){
	if(!!arr && !!ele){
		for(var i=0, len=arr.length; i<len; i++){
			if(arr[i].loginId == ele.loginId && arr[i].platformType == ele.platformType){
				return true;
			}
		}
	}
	return false;
}

/**
 * toast控件
 * @param  {Boolean} isOk    [description]
 * @param  {[type]}  content [description]
 * @return {[type]}          [description]
 */
function showToast(isOk, content){
	var node = $('<div class="toast f-pa"><span class="f-icon icon"></span><span class="cnt"></span></div>');
	node.children().eq(1).html(content);
	if(isOk){
		node.addClass("right");
		node.children().eq(0).text("");
		node.removeClass("wrong");
	}else{
		node.addClass("wrong");
		node.children().eq(0).text("");
		node.removeClass("right");
	}

	$(document.body).append(node);
	setTimeout(function(){
		node.fadeOut(300);
	}, 1000);

	setTimeout(function(){
		node.remove();
	}, 1300);
}

/**
 * 弹框提示
 * @param  {Boolean} isShow [description]
 * @param  {[type]}  time   [description]
 * @param  {[type]}  obj    [description]
 * @return {[type]}         [description]
 */
function newDialogOpt(isShow, time, obj){
	var oldObj = obj;
	if(!isShow){
		$("#j-indialog").fadeOut(time);
		$("#j-cover").fadeOut(time);
		setTimeout(function(){
			dialogNode.remove();
		}, time);
	}else{
		dialogNode = $('<div class="indialog f-pa f-bg" id="j-indialog">\
			<div class="item">\
				<span>账号</span>\
				<input id="loginId" type="text" />\
			</div>\
			<div class="item">\
				<span>备注</span>\
				<input id="description" type="text" />\
			</div>\
			<div>\
				<input type="button" class="cancle" value="取消"/>\
				<input type="button" class="add" value="保存"/>\
			</div>\
			<div class="cover f-pa" id="j-cover"></div>\
		</div>');
		if(obj){
			dialogNode.find("input#loginId").val(obj.loginId);
			dialogNode.find("input#description").val(obj.idType);
		}
		$(document.body).append(dialogNode);

		dialogNode.find(".add").on("click", function(e){
			var loginId = $("#loginId").val();
			var type = $("#description").val();

			var mailReg =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
			if(!loginId || !mailReg.test(loginId)){
				showToast(false, "请输入邮箱");
				return;
			}
			if(!type){
				showToast(false, "请输入类型");
				return;
			}
			var obj = {
				loginId: loginId,
				idType: type,
				platformType: platformType
			}

			chrome.storage.sync.get("account", function(items){
				var _items = items.account || [];
				if(oldObj){
					for(var i=0; i<_items.length; i++){
						if(_items[i].loginId == oldObj.loginId && _items[i].platformType == platformType){
							_items[i].loginId = obj.loginId;
							_items[i].idType = obj.idType;
						}
					}
				}else{
					if(!arrContain(_items, obj)){
						_items = _items.concat(obj);
					}
				}

				chrome.storage.sync.set({"account": _items});

				listData = _items;

				for(var i=listData.length-1; i>=0; i--){
					if(listData[i].platformType != platformType){
						listData.splice(i,1);
					}
				}
				updateList();

				newDialogOpt(false, 500);
			});
		});
		dialogNode.find(".cancle").on("click", function(e){
			newDialogOpt(false, 500);
		});
	}
}

function smallConfirmDialog(obj){
	var node = $('<div class="f-pa confirmdialog f-bg"><p class="title">'+obj.title+'</p><div class="opt f-cb"><div class="f-fl ok opts">确定</div><div class="f-fl no opts">取消</div></div></div><div class="cover f-pa" id="j-cover"></div>');
	$(document.body).append(node);
	$("#j-cover").show();
	$(node).find(".opts").on("click", function(e){
		node.animate({"top":0, opacity: 0}, 200);
		$("#j-cover").fadeOut(200);
		setTimeout(function(){
			node.remove();
			$("#j-cover").hide();
			if($(e.target).hasClass("ok")){
				obj.okFunc();
			}
		}, 200);
	});
}

/**
 * 加载完成事件
 */
var listData, dialogNode, curHost, curAccount, curAccountObj, platformType, openurl;
document.addEventListener('DOMContentLoaded', function () {
	curHost = chrome.extension.getBackgroundPage().curHost;
	curAccount = chrome.extension.getBackgroundPage().passport;
	switch(curHost){
		case "study.163.com":
			platformType = "stu";
		break;
		case "mooc.study.163.com":
			platformType = "msu";
		break;
		case "www.icourse163.org":
			platformType = "icu";
		break;
		default:
			platformType = "msu";
		break;
	}

	if(!!curAccount){
		curAccountObj = {"loginId": curAccount, type:"没填写", platformType: platformType};
	}
	chrome.storage.sync.get("account", function(items){
		listData = items.account || [];
		if(!!curAccountObj && !arrContain(listData, curAccountObj)){
			listData.concat(curAccountObj);
			chrome.storage.sync.set({"account": listData});
		}
		for(var i=listData.length-1; i>=0; i--){
			if(listData[i].platformType != platformType){
				listData.splice(i,1);
			}
		}
		updateList();
	});
});

function updateList(){
	$("#list").html("");
	if(listData.length){
		for(var i=0, len=listData.length; i<len; i++){
			var _str = (curAccountObj && listData[i].loginId==curAccountObj.loginId) ? "selected" : "";
			var htlTmp = '<div class="f-cb litem '+_str+'"><div class="f-icon sel f-fl"></div><div class="f-fl f-thide id">'+listData[i].loginId+
			'</div><div class="f-fl f-thide type">'+listData[i].idType+
			'</div><div class="opt f-fr"><span class="f-icon edit" title="编辑"></span><span class="f-icon del" title="删除"></span></div></div>';
			var node = $(htlTmp);
			$("#list").append(node);
		}
		$("#list").find(".edit").on("click", function(e){
			e.stopPropagation();
			var node = $(e.target), loginId = node.parent().prev().prev().html(), idType = node.parent().prev().html();
			newDialogOpt(true, 500, {loginId:loginId, idType:idType, platformType: platformType});
		});
		$("#list").find(".del").on("click", function(e){
			e.stopPropagation();
			var node = $(e.target), loginId = node.parent().prev().prev().html(), idType = node.parent().prev().html();
			smallConfirmDialog({
				"title": "确定删除该账号?",
				okFunc: function(){
					var obj = {loginId: loginId};
					chrome.storage.sync.get("account", function(items){
						var _items = items.account || [];
						for(var i=_items.length-1; i>=0; i--){
							if(_items[i].loginId == obj.loginId && _items[i].platformType == platformType){
								_items.splice(i, 1);
							}
						}
						chrome.storage.sync.set({"account": _items});
						node.parent().parent().remove();
						showToast(true, "删除成功");
					});
				}
			})
		});
		$("#list").find(".litem").on("click", function(e){
			e.stopPropagation();
			$("#list .litem").each(function(_index, item){
				$(item).removeClass("selected");
			})
			var loginId = $(this).children().eq(1).html();
			switch(curHost){
				case "study.163.com":
					openurl = "";
				break;
				case "mooc.study.163.com":
					openurl = "http://mooc.study.163.com/admin/superChangeIdByLoginId.htm?lid="+loginId;
				break;
				case "www.icourse163.org":
				default: 
					openurl = "http://www.icourse163.org/admin/superChangeIdByLoginId.htm?lid="+loginId;
				break;
			}
			if(!!openurl){
				$.get(openurl, {}, function(data){
					if(data=="ok"){
						chrome.tabs.executeScript(null,
					  		{"code": "window.location.reload()"}
					  	);
					  	window.close();
					}else{
						showToast(false, "没有此用户");
					}
				});
			}
		});
	}else{
		$("#list").html("<p class='empty'>暂无账号</p>");
	}
}

$("#new").click(function(){
	newDialogOpt(true, 500);
});

/*$(document).bind("contextmenu",function(e){  
    return false;  
});*/

// 功能测试用
var introPage = chrome.extension.getURL("intro.html");
$("#doubt").click(function(){
	window.open(introPage, "_self");
})