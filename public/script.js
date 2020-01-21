console.log('script initialized');
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../sw.js')
      .then(reg => {
        console.log('Service worker: Registered!')
      })
      .catch(e => {
        console.log(`Service Worker:  Error: ${e}`)
      });
  })
}