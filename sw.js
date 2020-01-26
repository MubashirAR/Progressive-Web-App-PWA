let CACHE_VERSION = '0.0.2';
urls = ['/public/', '/public/script.js', '/public/style.css'];
self.addEventListener('install', e => {
  console.log('Service Worker: Installed!');
  e.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(cache => {
        console.log('Service Worker: Cache opened', urls);
        cache.addAll(urls);
      })
      .catch(e => {
        console.error(e);
      }),
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) {
        console.log('returning cached result', e.request);
        return res;
      }
      console.log('sending request to the server');
      return fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type === 'basic') {
            return res;
          }
          console.log('New cache time');
          // Duplicate the stream to cache and pass to the browser
          var responseToCache = res.clone();
          caches.open(CACHE_VERSION).then(cache => {
            console.log('New cache received');
            cache.put(e.request, responseToCache);
          });
          return res;
        })
        .catch(e => {
          console.log('New cache failed');
          console.log(e);
        });
    }),
  );
});

// Background Sync

self.addEventListener('sync', function(event) {
  console.log('Service Worker sync:', event);
  
  if (event.tag === 'mySync') {
    console.log('Service Worker sync: ', event);
    event.waitUntil(
      new Promise((resolve, reject) => {
        try {
          console.log('SW: Time to fetch');
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
          .then(response => {
            console.log('SW: fetch response received');
            return response.json();
          })
          .then(data => {
            console.log('SW: fetch data');
            console.log(data);
            resolve(data);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
          // return data;
          
        } catch (error) {
          console.error(error);
          reject(error);
          // throw error;
        }
      })
    );
  }
});

self.addEventListener('push', event => {
  let text = event.data.text();
  console.log('Service Worker: Push Received:', event);

  const title = 'Ayy, new notification!';
  const options = {
    body: text,
    icon: './icons/icon-192.png',
    badge: './icons/icon-512.png'
  }
  console.log(title, options)
  let notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});
self.addEventListener('notificationclick', event => {
  console.log('SW: User clicked the notification.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://linkedin.com/in/mubashirar')
  )
})