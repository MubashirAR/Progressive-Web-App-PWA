let CACHE_VERSION='0.0.2';
urls = [
  '/public/',
  '/public/script.js',
  '/public/style.css'
]
self.addEventListener('install', e => {
  console.log('Service Worker: Installed!');
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('Service Worker: Cache opened', urls);
        cache.addAll(urls);
      })
      .catch(e => {
        console.error(e)
      })
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(res => {
        if(res) {
          console.log('returning cached result');
          return res;
        }
        console.log('sending request to the server');
        return fetch(e.request)
          .then(res => {
            if(!res || res.status !== 200 || res.type === 'basic') {
              return res;
            }
            console.log('New cache time')
             // Duplicate the stream to cache and pass to the browser
            var responseToCache = res.clone();
            caches.open(CACHE_VERSION)
              .then(cache => {
                console.log('New cache received')
                cache.put(e.request, responseToCache);
              });
              return res;
          })
          .catch(e => {
            console.log('New cache failed')
            console.log(e)
          })
      })
  )
})