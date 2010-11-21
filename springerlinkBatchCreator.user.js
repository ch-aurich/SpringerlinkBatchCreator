// ==UserScript==
// @name           SpringerBatchloadListCreator
// @namespace      http://c-aurich.de
// @description    create a batchlist that is compatible to bakermans batchload for springer books
// @include        http://*springerlink.com/*
// ==/UserScript==


function stripHTML(oldString) {
    var newString = "";
    var inTag = false;
    for(var i = 0; i < oldString.length; i++) 
    {  
        if(oldString.charAt(i) == '<') inTag = true;
        if(oldString.charAt(i) == '>') 
        {
            if(oldString.charAt(i+1)=="<")
            {
                //dont do anything
            }
            else
            {
                inTag = false;
                i++;
            }
        }
        if(!inTag) newString += oldString.charAt(i);
    }

    return newString;
}


//simulate document.getElementByClass
//attention: it only gets the first element of this class
//you could replace the code "elEditors = thisElem"
//for manipulating multiple elements directly
function getElementByClass(tagname, classname)
{
    var allElements = document.getElementsByTagName(tagname);
    for (var i = 0; i < allElements.length; i++) 
    {
        var thisElem = allElements[i];

        if (thisElem.className && thisElem.className == classname) 
        {
            return thisElem;
        }
    }
}

function cleanUpBatch()
{
    //alert("cleaning up");
    var SpringerCounter = GM_getValue("SpringerCounter", 0);
    var Books = new Array();
    var j = 0;
    for (var i=1; i<=SpringerCounter; i++)
    {
        recentISBN = GM_getValue("SpringerISBN" + i, "NULL");
        GM_deleteValue("SpringerISBN" + i);
        if (recentISBN!="NULL")
        {
            Books[j]=new Object();
            Books[j]['ISBN']=recentISBN;
            j++;
        }
    }
    //alert("finished reading");
    var newSpringerCounter = Books.length;
    GM_setValue("SpringerCounter", newSpringerCounter);
    //alert("new count of Books: " + newSpringerCounter);

    for (var i=0; i<j;i++)
    {
        //alert(Books[i]['ISBN']);
        GM_setValue("SpringerISBN" + (i + 1), Books[i]['ISBN']);
    }
}


function getRecentISBN()
{
    var href = window.location.pathname;
    var parts = href.split("/");
    var isbn;
    for (var i = 0; i<parts.length; i++)
    {
        if (parts[i] == "content")
        {
            isbn = parts[i+1];
        }
    }

    return isbn;
}


function delBookFromBatch()
{
    var searchISBN = getRecentISBN();
    var SpringerCounter = GM_getValue("SpringerCounter", 0);
    var success = false;
    for (var i=1; i<=SpringerCounter; i++)
    {
        recentISBN = GM_getValue("SpringerISBN" + i, "NULL");
        if (searchISBN==recentISBN&&success==false)
        {
            GM_deleteValue("SpringerISBN" + i);
            alert("deleted Book successfully");
            success = true;
        }
    }
    cleanUpBatch();
    LinkDel2Add();
}

function LinkDel2Add()
{
    var delBookSpringerBatch = document.getElementById('delBookSpringerBatch');
    delBookSpringerBatch.removeEventListener('click', delBookFromBatch, false); 

    elP = document.getElementById("SpringerBatchLink");
    elP.innerHTML = "<a id=\"addBookSpringerBatch\"><b>add book to batch</b></a><hr><hr>";
    
    var addBookSpringerBatch = document.getElementById('addBookSpringerBatch');
    addBookSpringerBatch.addEventListener('click', addBookToBatch, false);
    updateBooksOnBatch();
}

function addBookToBatch()
{

    var isbn = getRecentISBN();
    var title = getElementByClass("h1", "title");
    var strTitle = stripHTML(title.innerHTML);
    
    SpringerCounter = GM_getValue("SpringerCounter", 0);
    SpringerCounter++;
    GM_setValue("SpringerCounter", SpringerCounter)
    GM_setValue("SpringerISBN"+SpringerCounter, isbn);
    alert("added Book: \nisbn: " + isbn);

    LinkAdd2Del();
}

function LinkAdd2Del()
{
    var addBookSpringerBatch = document.getElementById('addBookSpringerBatch');
    addBookSpringerBatch.removeEventListener('click', addBookToBatch, false); 

    elP = document.getElementById("SpringerBatchLink");
    elP.innerHTML = "<a id=\"delBookSpringerBatch\"><b>delete book from batch</b></a><hr><hr>";
    
    var delBookSpringerBatch = document.getElementById('delBookSpringerBatch');
    delBookSpringerBatch.addEventListener('click', delBookFromBatch, false);
    updateBooksOnBatch();
}

function updateBooksOnBatch()
{
    var elList = document.getElementById("SpringerBatchList");

    SpringerCounter = GM_getValue("SpringerCounter", 0);
    var htmlText = "";
    for (var i=1; i<=SpringerCounter; i++)
    {
        htmlText = htmlText + "<hr>" + GM_getValue("SpringerISBN" + i, "NULL") + "<br>\n";
    }

    elList.innerHTML = htmlText;
}

function isBookOnBatch()
{
    var searchISBN = getRecentISBN();
    var SpringerCounter = GM_getValue("SpringerCounter", 0);

    //alertBooks();

    for (var i=1; i<=SpringerCounter; i++)
    {
        recentISBN = GM_getValue("SpringerISBN" + i, "NULL");
        //alert("recent:\t" + recentISBN + "\nsearch:\t" + searchISBN);
        if (searchISBN==recentISBN)
        {
            return 1;
        }
    }

    return 0;
}

function SpringerBatchClear()
{
    SpringerCounter = GM_getValue("SpringerCounter", 0);
    var alertTXT = "books added to batch until now:\n";
    for (var i=1; i<=SpringerCounter; i++)
    {
        GM_deleteValue("SpringerISBN" + i, "NULL") + "\n";
    }
    cleanUpBatch();
    updateBooksOnBatch();
    updateDisplay();
}

function updateDisplay()
{
    if (isBookOnBatch()==0)
    {
        if (document.getElementById('SpringerBatchLink').innerHTML=="<a id=\"delBookSpringerBatch\"><b>delete book from batch</b></a><hr><hr>")
        {
            LinkDel2Add();
        }
    }
    if (isBookOnBatch()==1)
    {
        if (document.getElementById('SpringerBatchLink').innerHTML=="<a id=\"addBookSpringerBatch\"><b>add book to batch</b></a><hr><hr>")
        {
            LinkAdd2Del();
        }
    }
}



function alertBooks()
{
    SpringerCounter = GM_getValue("SpringerCounter", 0);
    var alertTXT = "books added to batch until now:\n";
    for (var i=1; i<=SpringerCounter; i++)
    {
        alertTXT = alertTXT + GM_getValue("SpringerISBN" + i, "NULL") + "\n";
    }

    alert(alertTXT);
}

var elAuthors, newElement, isBookElement, isBook;

isBook = false;
isBookElement = getElementByClass("li", "first ui-state-default ui-corner-top ui-tabs-selected ui-state-active");
if (isBookElement&&isBookElement.innerHTML=="<a href=\"#BookSection\">Book</a>")
{
    isBook = true;
}

var elAbout = document.getElementById("Cockpit");
if (elAbout)
{
    var newElement3;
    newElement3 = document.createElement('div');
    newElement3.id = "SpringerBatchListContainer";
    newElement3.setAttribute("class", "subsection");
    newElement3.innerHTML = "<b id=\"booklistcaption\">books for batchdownload</b>\
                            <div id=\"SpringerBatchList\"><p id=\"SpringerBatchNoBook\">no book so far</p></div><hr>\
                            <a id=\"SpringerBatchClear\">clear batch</a>";
    elAbout.parentNode.insertBefore(newElement3, elAbout.nextSibiling);

    var clearSpringerBatch = document.getElementById('SpringerBatchClear');
    clearSpringerBatch.addEventListener('click', SpringerBatchClear, false);

    updateBooksOnBatch();
}

if (isBook) 
{    
    /*
    elAuthors = getElementByClass("p", "authors");
    if (!elAuthors) elAuthors = getElementByClass("p", "editors");
    */
    elBooklist = document.getElementById("booklistcaption");
    newElement = document.createElement('p');
    newElement.id = "SpringerBatchLink";
    newElement.innerHTML = "<a id=\"addBookSpringerBatch\"><b>add book to batch</b></a><hr><hr>";

    elBooklist.parentNode.insertBefore(newElement, elBooklist);

    var addBookSpringerBatch = document.getElementById('addBookSpringerBatch');
    addBookSpringerBatch.addEventListener('click', addBookToBatch, false);
    
    if (isBookOnBatch()==1)
    {
        LinkAdd2Del();
    }
}


//unsafeWindow.addEventListener('onFocus', updateBooksOnBatch(), false);
