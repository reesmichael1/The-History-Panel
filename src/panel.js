function init() {
    updateFolders();
}

var search = document.querySelector("#search");
var lastClickedElement;

search.onchange = function() {
    updateFolders();
}

function updateFolders(){
    var searchString = search.value;
    var htmlString = '';
    var today = new Date();
    var secondsInDay = 86400000; // technically milliseconds
    getHTMLString(function(htmlString){
        document.getElementById('today').innerHTML = htmlString;
    }, searchString, today.getTime() - secondsInDay, today.getTime(), '-today');
    getHTMLString(function(htmlString){
        document.getElementById('yesterday').innerHTML = htmlString;
    }, searchString, today.getTime() - 2 * secondsInDay, today.getTime() - secondsInDay + 1, '-yesterday');
    getHTMLString(function(htmlString){
        document.getElementById('week').innerHTML = htmlString;
    }, searchString, today.getTime() - 7 * secondsInDay, today.getTime() - 2 * secondsInDay + 1, '-week');
    getHTMLString(function(htmlString){
        document.getElementById('month').innerHTML = htmlString;
    }, searchString, today.getTime() - 30 * secondsInDay, today.getTime() - 7 * secondsInDay + 1, '-month');
    getHTMLString(function(htmlString){
        document.getElementById('older').innerHTML = htmlString;
    }, searchString, 0, today.getTime() - 30 * secondsInDay + 1, '-older');
}

var getHTMLString = function(callback, searchString, startTime, endTime, timeString) {
    var htmlString = '';
    var today = new Date();
    var todaySeconds = today.getTime();
    chrome.history.search({text: searchString, startTime: startTime, endTime: endTime}, function(results) {
        var visitedPages = new Object();
        results.forEach(function(page){
            var domainName = new URL(page.url).hostname;
            if (domainName.indexOf('www.') == 0) domainName = domainName.replace('www.','');
            if (!visitedPages.hasOwnProperty(domainName)) {
                visitedPages[domainName] = domainName;
            }
        });
        for (var domainName in visitedPages) {
            htmlString += "<li><label for=\"" + domainName + "\">" + domainName + "</label><input type=\"checkbox\" /><ol id=\"" + domainName + timeString + "\">";
                results.forEach(function(page){
                    if (page.url.indexOf(domainName) > -1) {
                        var maxTitleLength = 20; // perhaps this could be dynamic
                        var displayTitle = page.title;
                        if (displayTitle.length > maxTitleLength) {
                            displayTitle = displayTitle.substring(0, maxTitleLength) + '...';
                        }
                        htmlString += "<li class=\"file\"><a href=\"" + page.url + "\" id=\"" + page.url + timeString + "\">" + displayTitle + "</a></li>";
                    }
                });
            htmlString += "</ol></li>";
        }
        callback(htmlString);
    });
};

document.addEventListener("DOMContentLoaded", updateFolders);
document.addEventListener("mousedown", function(event){
    if (event.which === 3) {
        if (["LI", "OL"].indexOf(event.target.parentNode.nodeName) > -1) {
            var generatedHTML = document.querySelector('#root');
            // Perhaps the ugliest way imaginable of finding 
            // which element was clicked on
            loop1:
                // Check top level folders
                for (var i = 0; i < generatedHTML.childNodes.length; i++) { 
                    var childNode = generatedHTML.childNodes[i];
                    if (event.target.id.indexOf(childNode.id) > -1 && childNode.id != "") {
                        lastClickedElement = childNode;
                        break;
                    } else {
                        // Check folders sorted by domain name
                        for (var j = 0; j < childNode.childNodes.length; j++) { 
                            var grandchildNode = childNode.childNodes[j];
                            if (event.target.id.indexOf(grandchildNode.id) > -1 && childNode.id != "") {
                                lastClickedElement = grandchildNode;
                                break loop1;
                            } else {
                                // Check individual links
                                for (var k = 0; k < grandchildNode.childNodes.length; k++) {
                                    var greatGrandchildNode = grandchildNode.childNodes[k];
                                    if (event.target.id.indexOf(greatGrandchildNode.id) > -1 && childNode.id != "") {
                                        lastClickedElement = greatGrandchildNode;
                                        break loop1;
                                    }
                                }
                            }
                        }
                    }
                }
            chrome.contextMenus.removeAll();
            chrome.contextMenus.create({
                title: "Remove from History",
                contexts: ["all"],
                onclick: removeFromHistory,
                documentUrlPatterns: ["chrome-extension://*/thp-panel.html"],
                targetUrlPatterns: ["<all_urls>"]
            });
        } else {
            chrome.contextMenus.removeAll();
        }
    }
}, true);

function removeURLFromHistory(url) {
}

function removeFromHistory(info){
    var clickedLink = info.href;
}

