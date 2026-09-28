/* ============================================================
   BOARDINGPAY SERVICE WORKER
   Offline Cache / App Support
============================================================ */

const CACHE_NAME = "boardingpay-v1";

/*
   Main files of the BoardingPay application
*/
const APP_FILES = [
    "./",
    "./index.html",
    "./welcome.html",
    "./get-started.html",
    "./login.html",

    /* Admin */
    "./admin-register.html",
    "./create-account.html",
    "./completeprofile.html",
    "./admin-dashboard.html",

    /* Landlord */
    "./landlord-register.html",
    "./landlord-dashboard.html",

    /* Tenant */
    "./tenant-register.html",
    "./tenant-dashboard.html",

    /* Payments */
    "./paymentmethod.html",
    "./payment-details.html",
    "./payment-success.html",

    /* Other pages */
    "./profile.html",
    "./settings.html",
    "./history.html",
    "./announcements.html",
    "./contact.html",
    "./forgot-password.html",
     "./cashin.html",
    

    /* CSS */
    "./style.css",

    /* JavaScript */
    "./script.js"
];


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener("install", event => {

    console.log("[BoardingPay SW] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {

                console.log("[BoardingPay SW] Caching app files...");

                return cache.addAll(APP_FILES);
            })
            .then(() => {

                console.log("[BoardingPay SW] Installation complete.");

                return self.skipWaiting();
            })
            .catch(error => {

                console.error(
                    "[BoardingPay SW] Cache installation failed:",
                    error
                );
            })
    );
});


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener("activate", event => {

    console.log("[BoardingPay SW] Activating...");

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(cacheName => {

                            return (
                                cacheName.startsWith("boardingpay-") &&
                                cacheName !== CACHE_NAME
                            );

                        })
                        .map(oldCache => {

                            console.log(
                                "[BoardingPay SW] Removing old cache:",
                                oldCache
                            );

                            return caches.delete(oldCache);

                        })

                );

            })
            .then(() => {

                console.log(
                    "[BoardingPay SW] Activation complete."
                );

                return self.clients.claim();

            })

    );
});


/* ============================================================
   FETCH
   OFFLINE-FIRST
============================================================ */

self.addEventListener("fetch", event => {

    const request = event.request;

    /*
       Only handle GET requests.
    */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                /*
                   If file exists in cache,
                   use cached version.
                */

                if (cachedResponse) {

                    return cachedResponse;
                }


                /*
                   Otherwise try internet.
                */

                return fetch(request)
                    .then(networkResponse => {

                        /*
                           Save successful response
                           into cache.
                        */

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        /*
                           If offline and the requested page
                           is not cached, return index.html.
                        */

                        if (
                            request.destination === "document"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                    });

            })

    );
});


/* ============================================================
   MESSAGE HANDLER
============================================================ */

self.addEventListener("message", event => {

    if (!event.data) {
        return;
    }


    /*
       Force service worker to activate immediately.
    */

    if (event.data.action === "SKIP_WAITING") {

        self.skipWaiting();

    }


    /*
       Clear all BoardingPay caches.
    */

    if (event.data.action === "CLEAR_CACHE") {

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        return caches.delete(
                            cacheName
                        );

                    })

                );

            });

    }

});