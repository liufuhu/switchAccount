var _passPortNode = $(".j-passportforplug"), passport;
if(!!_passPortNode){
	passport = _passPortNode.html() || "";
}else{
	passport = "";
}

chrome.runtime.sendMessage({type: EVENTS.GET_LOGIN_PASSPORT, passport: passport});

/*chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	switch(request.type){
		case EVENTS.GET_LOGIN_PASSPORT:
			// 获取当前账号的信息 后续扩展使用
			var nickname = $(".nickname").children().eq(0).html();
		break;
	}
});*/