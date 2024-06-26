

function main() {
    document.querySelector('form').addEventListener('submit', handleSubmit);
}

// on dom content loaded, call main
document.addEventListener('DOMContentLoaded', main);
function setErrorMessage(message) {
    // get #error element
    const errorElement = document.querySelector('#error');
    // set textContent to message
    errorElement.textContent = message;
}

function clearErrorMessage() {
    // get #error element
    const errorElement = document.querySelector('#error');
    // set textContent to empty string
    errorElement.textContent = '';
}

function handleSubmit(event) {
    event.preventDefault();
    const input = event.target.querySelector('input').value;

    console.log(input);

    if (!input) {
        setErrorMessage('Please enter a URL');
        return
    }

    // regex to check if input is a valid url
    const urlRegex = new RegExp('^(http|https)://', 'i');
    if (!urlRegex.test(input)) {
        setErrorMessage('Please enter a valid URL');
        return
    }

    // call env var $API_URL with input in post
    fetch(`/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "shortKey": input.toString(),
        })
    }).then(r => r.text())
        .then(shortLink => {
            const form = event.target;
            const fullUrl = `${window.location.origin}/${shortLink}`;
            form.innerHTML = `<p>${fullUrl}</p>`;
            clearErrorMessage()
        });
}