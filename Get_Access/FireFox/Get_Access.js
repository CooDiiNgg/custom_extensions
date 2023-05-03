browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.reload();
    browser.webRequest.onHeadersReceived.addListener(
        logResponseData,
        { urls: ["<all_urls>"]},
        ["responseHeaders", "blocking"]
    );
});

  
  function logResponseData(details) {
    if (details.method === "POST" && details.url.includes("tQS")) {      
        if(details.url.split("_reqid=")[1].split("&")[0].startsWith("2") || details.url.split("_reqid=")[1].split("&")[0].startsWith("3")){
            // checking the first or third request(reference: https://kovatch.medium.com/deciphering-google-batchexecute-74991e4e446c)
            let responseStream = browser.webRequest.filterResponseData(details.requestId);
            let decoder = new TextDecoder();
            let responseText = "";

            responseStream.ondata = event => {
                responseText += decoder.decode(event.data, {stream: true});
                responseStream.write(event.data);
            };
            responseStream.onstop = event => {
                if(responseText.search("https://drive.google.com") != -1){
                    var url = responseText.split("https://drive.google.com")[responseText.split("https://drive.google.com").length - 1].split('"')[0];
                    url = "https://drive.google.com" + url;
                    console.log(url);
                    browser.tabs.create({url: url});
                }
                responseStream.close();
                Delete_listeners();
            }
         }
  
        return {};
    }
}


function Delete_listeners(){
    browser.webRequest.onHeadersReceived.removeListener(logResponseData);
}
  