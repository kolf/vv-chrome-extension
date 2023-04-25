chrome.webRequest.onBeforeSendHeaders.addListener(
  function (e) {
    alert(JSON.stringify(e));
    // console.log("details:", details)
    // details.requestHeaders.push({ name: "test-header", value: "test-demo" });
    // return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);
alert(1)