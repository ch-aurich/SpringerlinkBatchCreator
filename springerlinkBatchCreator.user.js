// ==UserScript==
// @name           SpringerBatchloadListCreator
// @namespace      http://c-aurich.de
// @description    create a batchlist that is compatible to bakermans batchload for springer books
// @include        http://www.springerlink.com/content/*
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

    for (var i=0; i<j.length;i++)
    {
        GM_setValue("SpringerISBN" + i, Books[j]['ISBN']);
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

    for (var i=1; i<=SpringerCounter; i++)
    {
        recentISBN = GM_getValue("SpringerISBN" + i, "NULL");
        if (searchISBN==recentISBN)
        {
            GM_deleteValue("SpringerISBN" + i);
            alert("deleted Book successfully");
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
    elP.innerHTML = "<a id=\"addBookSpringerBatch\">Buch zu Batch hinzufügen</a>";
    
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
    elP.innerHTML = "<a id=\"delBookSpringerBatch\">Buch von Batch entfernen</a>";
    
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
    var alertTXT = "Books added to Batch until now:\n";
    for (var i=1; i<=SpringerCounter; i++)
    {
        GM_deleteValue("SpringerISBN" + i, "NULL") + "\n";
    }
    
    cleanUpBatch();
    updateBooksOnBatch();
}


function alertBooks()
{
    SpringerCounter = GM_getValue("SpringerCounter", 0);
    var alertTXT = "Books added to Batch until now:\n";
    for (var i=1; i<=SpringerCounter; i++)
    {
        alertTXT = alertTXT + GM_getValue("SpringerISBN" + i, "NULL") + "\n";
    }

    alert(alertTXT);
}

var elAuthors, newElement;


elAuthors = getElementByClass("p", "authors");
if (!elAuthors) elAuthors = getElementByClass("p", "editors");

if (elAuthors) 
{
    newElement = document.createElement('hr');
    elAuthors.parentNode.insertBefore(newElement, elAuthors.nextSibling);
    var newElement2;
    newElement2 = document.createElement('p');
    newElement2.id = "SpringerBatchLink";
    newElement2.innerHTML = "<a id=\"addBookSpringerBatch\">Buch zu Batch hinzufügen</a>";
    newElement.parentNode.insertBefore(newElement2, newElement.nextSibiling);

    var addBookSpringerBatch = document.getElementById('addBookSpringerBatch');
    addBookSpringerBatch.addEventListener('click', addBookToBatch, false);
    
    var elAbout = document.getElementById("AboutSection");
    var newElement3;
    newElement3 = document.createElement('div');
    newElement3.id = "SpringerBatchListContainer";
    newElement3.setAttribute("class", "subsection");
    newElement3.innerHTML = "<b>Books for batchdownload</b><div id=\"SpringerBatchList\"><p id=\"SpringerBatchNoBook\">no book so far</p></div><hr>\
                            <a id=\"SpringerBatchClear\">clear batch</a>";
    elAbout.parentNode.insertBefore(newElement3, elAbout.nextSibiling);

    var clearSpringerBatch = document.getElementById('SpringerBatchClear');
    clearSpringerBatch.addEventListener('click', SpringerBatchClear, false);


    if (isBookOnBatch()==1)
    {
        LinkAdd2Del();
    }



    updateBooksOnBatch();
}
else
{
	alert("kein Buch?");
}
