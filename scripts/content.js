
const insert = (content) => {
    try {
        // Find Calmly editor input section
        const textEditor = document.getElementById('main');

        if (!textEditor) return;

        // Grab the first p tag so we can replace it with our injection
        // Grab the first p tag so we can replace it with our injection
        const pToRemove = textEditor.childNodes[0];
        pToRemove.remove();

        // Split content by \n
        const splitContent = content.split('\n');

        // Wrap in p tags
        splitContent.forEach((content) => {
            const p = document.createElement('p');

            if (content === '') {
                const br = document.createElement('br');
                p.appendChild(br);
            } else {
                p.textContent = content;
            }

            // Insert into HTML one at a time
            textEditor.appendChild(p);
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const { content } = request;

        // Call this insert function
        const result = insert(content);

        // If something went wrong, send a failed status
        if (!result) {
            sendResponse({ status: 'failed' });
        }

        sendResponse({ status: 'success' });
    }
});