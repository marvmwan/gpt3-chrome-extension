

const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
}

const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            { message: 'inject', content },
            (response) => {
                if (response.status === 'failed') {
                    console.log('injection failed.');
                }
            }
        );
    });
};

const generate = async (prompt) => {

    const apiKey = await getKey()
    const url = 'https://api.openai.com/v1/completions';

    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });


    // Select the top choice and send back
    const completion = await completionResponse.json();
    return completion.choices.pop();
}


const generateCompletionAction = async (info) => {

    sendMessage("Generating...");
    // const loading = () => {
    //     sendMessage("Generating");
    //     setTimeout(() => { }, 500);
    //     sendMessage("Generating.");
    //     setTimeout(() => { }, 500);
    //     sendMessage("Generating..");
    //     setTimeout(() => { }, 500);
    //     sendMessage("Generating...");
    // };

    // let loadingInterval = setInterval(loading, 1000);

    // setTimeout(() => clearInterval(loadingInterval), 10000)

    try {
        const { selectionText } = info;
        const basePromptPrefix = `
	Write me a detailed table of contents for a blog post with the title below.

	Title:
	`;

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}\n\nTable of contents: `);

        const secondPrompt = `
      Take the table of contents and title of the blog post below and generate a blog post written in thwe style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.
      
      Title: ${selectionText}
      
      Table of Contents: ${baseCompletion.text}
      
      Blog Post:
      `;

        // Call your second prompt
        const secondPromptCompletion = await generate(secondPrompt);

        // Let's see what we get!
        console.log(secondPromptCompletion.text.trim());

        // clearInterval(loadingInterval);
        // loadingInterval = 0; // I just do this so I know I've cleared the interval

        sendMessage(secondPromptCompletion.text.trim())
    } catch (error) {
        console.log(error);

        // clearInterval(loadingInterval);
        // loadingInterval = 0; // I just do this so I know I've cleared the interval

        sendMessage(error.toString());
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate blog post',
        contexts: ['selection'],
    });
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);