console.log('script initialized');
let deferredPrompt;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let btn = document.getElementById('install');
    navigator.serviceWorker
      .register('../sw.js')
      .then(reg => {
        console.log('Service worker: Registered!');
        reg.sync.register('mySync');
        window.addEventListener('beforeinstallprompt', e => {
          console.log(`Service Worker: beforeinstallprompt`);
          // Prevent Chrome 76 and later from showing the mini-infobar
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          btn.addEventListener('click', installApp);
          window.addEventListener('appinstalled', (evt) => {
            console.log('App installed!');
          });
        });
      })
      .catch(e => {
        console.log(`Service Worker:  Error: ${e}`);
        getPosts();
      });
  });
} else {
  getPosts();
}
let getPosts = () => {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: 'foo',
      body: 'bar',
      userId: 1,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(e => console.error(e));
};
function installApp() {
  console.log('installApp')
  
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    deferredPrompt = null;
  });
}
