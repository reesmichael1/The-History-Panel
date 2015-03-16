function init() {
    updateFolders();
}

var search = document.querySelector("#search");

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
    }, searchString, today.getTime() - secondsInDay, today.getTime());
    getHTMLString(function(htmlString){
        document.getElementById('yesterday').innerHTML = htmlString;
    }, searchString, today.getTime() - 2 * secondsInDay, today.getTime() - secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('week').innerHTML = htmlString;
    }, searchString, today.getTime() - 7 * secondsInDay, today.getTime() - 2 * secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('month').innerHTML = htmlString;
    }, searchString, today.getTime() - 30 * secondsInDay, today.getTime() - 7 * secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('older').innerHTML = htmlString;
    }, searchString, 0, today.getTime() - 30 * secondsInDay + 1);
}

var getHTMLString = function(callback, searchString, startTime, endTime) {
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
            htmlString += "<li><label>" + domainName + "</label><input type=\"checkbox\" /><ol>";
                results.forEach(function(page){
                    if (page.url.indexOf(domainName) > -1) {
                        var maxTitleLength = 20; // perhaps this could be dynamic
                        var displayTitle = page.title;
                        if (displayTitle.length > maxTitleLength) {
                            displayTitle = displayTitle.substring(0, maxTitleLength) + '...';
                        }
                        htmlString += "<li class=\"file\"><a href=\"" + page.url + "\">" + displayTitle + "</a></li>";
                    }
                });
            htmlString += "</ol></li>";
        }
        callback(htmlString);
    });
};

document.addEventListener("DOMContentLoaded", updateFolders);
