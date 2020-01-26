console.log('script initialized');
let deferredPrompt;
let swReg;
const applicationServerPublicKey = 'BOy5Rh0_YA0UKLzt94nz0mGAHURBiOkxs8QgBxvPsKCUbiRQr7qktxNuhi3kYWTp5NB6-JqfD0Dy8lsN0Kwm3jI';
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('SW and PushManager present!');
  window.addEventListener('load', () => {
    let btn = document.getElementById('install');
    navigator.serviceWorker
      .register('../sw.js')
      .then(reg => {
        swReg = reg;
        enablePush();
        console.log('Service worker: Registered!');
        reg.sync.register('mySync');
        window.addEventListener('beforeinstallprompt', e => {
          console.log(`Service Worker: beforeinstallprompt`);
          // Prevent Chrome 76 and later from showing the mini-infobar
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          btn.addEventListener('click', installApp);
          window.addEventListener('appinstalled', evt => {
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
  console.log('installApp');

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

function enablePush() {
  swReg.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = subscription !== null;
    console.log({ isSubscribed });
    // if(isSubscribed){
    //   let btn = document.getElementById('push');
    //   btn.disabled = false;
    //   return;
    // }
    if (!isSubscribed) {
      subscribeUser();
    }

    // if (Notification.permission === 'denied') {
    //   alert('Please enable Notifications from the i button above');
    // }
  });
}
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swReg.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
    .then(function(subscription) {
      console.log('User is now Subscribed');
      // updateSubscriptionOnServer(subscription);
      isSubscribed = true;
      console.log(JSON.stringify(subscription));
      console.log(subscription);
    })
    .catch(e => {
      console.log('User is NOT Subscribed', e);
      alert('Please enable Notifications from the i button above');
    });
}
// Needed to send authKey
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
