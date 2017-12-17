////////////////////////////////////////////////////////////////////////////////
// DATA STRUCTURES /////////////////////////////////////////////////////////////

var Link = require('./link.js');
// Example: const newlink = new Link(title, url, author);

const linkList = require("./linklist.js");
// Example: linkList.links;
// Example: linkList.add(newLink);

// const HOST = 'http://localhost:3000';
const HOST = 'https://social-news-webapp-toy.herokuapp.com';

////////////////////////////////////////////////////////////////////////////////
// UPDATE //////////////////////////////////////////////////////////////////////

// Renders a form to enter a new Link for the webpage.
let isLinkFormShown = false;
const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", e => {

    // If the Link Form is already shown, no further work should be done.
    if (isLinkFormShown) {
        return;
    } else { // No Link Form is currently being displayed; render one!
        isLinkFormShown = true;
        submitButton.disabled = true;
    }

    /*
     * Render the form.
     * -> Here we create the new Link form text (HTML) +
     *  insert the form as the first "thing" within the content `div` before any links.
     */

    var addLinkFormHTML =
        '<form class="linkForm"> \
         <input type="text" id="author" required placeholder="Your Name"> \
         <input type="text" id="title" required placeholder="Page Title"> \
         <input type="text" id="url" required placeholder="URL"> \
         <input id="addLinkButton" type="submit" value="Add Link"> \
         </form>';
    document.getElementById('content').insertAdjacentHTML("afterBegin", addLinkFormHTML);

    /*
     * Form-handling.
     */

    // Shows all user input and cancels form data sending
    document.querySelector("form").addEventListener("submit", e => {
        // prevent default sending off to a server; do our stuff instead...
        e.preventDefault();

        // TODO: OTHER INPUT VALIDATION?

        // // extract data from the form & add to list of Link objects
        const author = e.target.elements.author.value;
        const title = e.target.elements.title.value;
        const url = e.target.elements.url.value;
        var link = new Link(title, url, author); // create an object; the object handles validation.

        // Create a FormData object, passing the form as a parameter
        const formData = new FormData();
        formData.append("author", link.author);
        formData.append("title", link.title);
        formData.append("url", link.url);

        // Send form data to the server with an asynchronous POST request
        fetch(`${HOST}/api/link`, {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(result => {

            // Success! Adding the new Link, clear "content," and display the updated list
            var linkObj = JSON.parse(result);
            linkList.addLinkToTop(new Link(linkObj.title, linkObj.url, linkObj.author));
            view.displayLinks();

            // remove the form itself & update page controls (i.e., re-enable submit button)
            isLinkFormShown = false;
            submitButton.disabled = false;

            // user feedback: display "success" text & setup timer to clear it in 2 seconds.
            const resultElement = document.createElement("div");
            resultElement.id = 'resultElement';
            resultElement.className = 'link';
            resultElement.innerHTML = `Success! The link '${title}' has been successfully added!`;
            document.getElementById('content').insertAdjacentHTML("afterBegin", resultElement.outerHTML);
            setTimeout(() => {
                document.getElementById('content').removeChild(document.getElementById("resultElement"));
            }, 2000);

        })
        .catch(err => {
            console.error(err.message);

            // Failure! Cannot add the new Link...
            linkList.addLinkToTop(new Link(title, url, author));
            view.displayLinks(); // (to clear the form)

            // remove the form itself & update page controls (i.e., re-enable submit button)
            isLinkFormShown = false;
            submitButton.disabled = false;

            // user feedback: display "success" text & setup timer to clear it in 2 seconds.
            const resultElement = document.createElement("div");
            resultElement.id = 'resultElement';
            resultElement.className = 'link';
            resultElement.style.backgroundColor = '#FF3030';
            resultElement.style.color = '#8B1A1A';
            resultElement.innerHTML = `Failed! The link '${title}' could not be added to the server - please check your Internet connection...`;
            document.getElementById('content').insertAdjacentHTML("afterBegin", resultElement.outerHTML);
            setTimeout(() => {
                document.getElementById('content').removeChild(document.getElementById("resultElement"));
            }, 3000);
        });

    });
}, this);

////////////////////////////////////////////////////////////////////////////////
// DISPLAY /////////////////////////////////////////////////////////////////////

// An object for UI-related methods
var view = {
    displayLinks: function() {
        const content = document.getElementById("content");
        content.innerHTML = '';

        linkList.links.forEach((current, index, inputArray) => {
            const linkdiv = document.createElement("div");
            linkdiv.id = index;
            linkdiv.className = 'link';
            linkdiv.innerHTML = current.getHTML();
            content.appendChild(linkdiv);
        });
    }
};

////////////////////////////////////////////////////////////////////////////////
// MAIN ////////////////////////////////////////////////////////////////////////

/*
 * Try to fetch current news from our webserver API (works only if our webserver is "up")
 */
 var offlinemode = false;

fetch(`${HOST}/api/news`)
    .then(response => response.json()) // Translate JSON into JavaScript
    .then(links => {
        console.log("online mode");
        console.log(links);
        links.forEach(link => {
            linkList.addLink(new Link(link.title, link.url, link.author));
            view.displayLinks();
        });
    })
    .catch(err => {
        // Webserver is most likely down.
        // Add a few default Links (works even if our webserver is not "up")
        console.log("offline mode");
        offlinemode = true;
        document.getElementById('content').insertAdjacentHTML("afterend", "<center><i>webserver not available - offline mode</i></center>");

        linkList.addLink(new Link("Wikipedia", "http://wikipedia.org", "Sophie"));
        linkList.addLink(new Link("Hacker News", "https://news.ycombinator.com", "Baptiste"));
        linkList.addLink(new Link("Reddit", "https://reddit.com", "Thomas"));
        linkList.addLink(new Link("Boing Boing", "https://boingboing.net", "Daniel"));
        view.displayLinks();

        // console.error(`ERROR: ${err.message}`);
    });
