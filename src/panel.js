function init() {
    updateFolders();
}

function updateFolders(){
    var htmlString = '';
    var today = new Date();
    var secondsInDay = 86400000; // technically milliseconds
    getHTMLString(function(htmlString){
        document.getElementById('today').innerHTML = htmlString;
    }, today.getTime() - secondsInDay, today.getTime());
    getHTMLString(function(htmlString){
        document.getElementById('yesterday').innerHTML = htmlString;
    }, today.getTime() - 2 * secondsInDay, today.getTime() - secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('week').innerHTML = htmlString;
    }, today.getTime() - 7 * secondsInDay, today.getTime() - 2 * secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('month').innerHTML = htmlString;
    }, today.getTime() - 30 * secondsInDay, today.getTime() - 7 * secondsInDay + 1);
    getHTMLString(function(htmlString){
        document.getElementById('older').innerHTML = htmlString;
    }, 0, today.getTime() - 30 * secondsInDay + 1);
}

var getHTMLString = function(callback, startTime, endTime) {
    var htmlString = '';
    var today = new Date();
    var todaySeconds = today.getTime();
    chrome.history.search({text: '', startTime: startTime, endTime: endTime}, function(results) {
         results.forEach(function(page) {
             var maxTitleLength = 20; // perhaps this could be dynamic
             var displayTitle = page.title;
             if (displayTitle.length > maxTitleLength) {
                displayTitle = displayTitle.substring(0, maxTitleLength) + '...';
             }
             htmlString += "<li class=\"file\"><a href=\"" + page.url + "\">" + displayTitle + "</a></li>";
         });
         callback(htmlString);
    });
};

document.addEventListener("DOMContentLoaded", updateFolders);
