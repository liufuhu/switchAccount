var curHost, passport;
function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

function checkForValidUrl(tabId, changeInfo, tab) {
	curHost = getDomainFromUrl(tab.url).toLowerCase();
	if(curHost=="study.163.com" || curHost=="mooc.study.163.com" || curHost=="www.icourse163.org"){
		chrome.pageAction.show(tabId);
		// chrome.tabs.sendMessage(tabId, {type: EVENTS.GET_LOGIN_PASSPORT});
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	switch(request.type){
		case EVENTS.GET_LOGIN_PASSPORT:
			passport = request.passport;
		break;
	}
});
