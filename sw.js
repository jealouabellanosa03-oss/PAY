/* ============================================================
   BOARDINGPAY SERVICE WORKER
   OFFLINE-FIRST / GITHUB PAGES SAFE
============================================================ */

const CACHE_NAME = "boardingpay-v2";

/* ============================================================
   BOARDINGPAY APP FILES
============================================================ */

const APP_FILES = [
    "./",
    "./index.html",
    "./welcome.html",
    "./get-started.html",
    "./login.html",

    /* ADMIN */
    "./admin-register.html",
    "./create-account.html",
    "./completeprofile.html",
    "./admin-dashboard.html",

    /* LANDLORD */
    "./landlord-register.html",
    "./landlord-dashboard.html",

    /* TENANT */
    "./tenant-register.html",
    "./tenant-dashboard.html",

    /* PAYMENTS */
    "./paymentmethod.html",
    "./payment-details.html",
    "./payment-success.html",

    /* OTHER PAGES */
    "./profile.html",
    "./settings.html",
    "./history.html",
    "./announcements.html",
    "./contact.html",
    "./forgot-password.html",

    /* CSS */
    "./style.css",

    /* JAVASCRIPT */
    "./script.js"
];


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener("install", event => {

    console.log(
        "[BoardingPay SW] Installing:",
        CACHE_NAME
    );

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(async cache => {

                /*
                   Cache each file separately.

                   IMPORTANT:
                   If one file is missing, the other files
                   will STILL be cached.
                */

                for (const file of APP_FILES) {

                    try {

                        const response = await fetch(
                            new Request(file, {
                                cache: "no-store"
                            })
                        );

                        if (!response.ok) {

                            console.warn(
                                "[BoardingPay SW] File not cached:",
                                file,
                                response.status
                            );

                            continue;
                        }

                        await cache.put(
                            file,
                            response.clone()
                        );

                        console.log(
                            "[BoardingPay SW] Cached:",
                            file
                        );

                    } catch (error) {

                        console.warn(
                            "[BoardingPay SW] Could not cache:",
                            file,
                            error
                        );

                    }

                }

                console.log(
                    "[BoardingPay SW] Installation finished."
                );

            })

            .then(() => {

                /*
                   Activate this Service Worker immediately.
                */

                return self.skipWaiting();

            })

    );

});


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener("activate", event => {

    console.log(
        "[BoardingPay SW] Activating:",
        CACHE_NAME
    );

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(cacheName => {

                            return (
                                cacheName.startsWith(
                                    "boardingpay-"
                                ) &&
                                cacheName !== CACHE_NAME
                            );

                        })

                        .map(oldCache => {

                            console.log(
                                "[BoardingPay SW] Removing old cache:",
                                oldCache
                            );

                            return caches.delete(
                                oldCache
                            );

                        })

                );

            })

            .then(() => {

                /*
                   Take control of all open pages.
                */

                return self.clients.claim();

            })

            .then(() => {

                console.log(
                    "[BoardingPay SW] Activation complete."
                );

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
       Only process GET requests.
    */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                /*
                   ============================================
                   1. FILE FOUND IN CACHE
                   ============================================
                */

                if (cachedResponse) {

                    console.log(
                        "[BoardingPay SW] CACHE:",
                        request.url
                    );

                    return cachedResponse;

                }


                /*
                   ============================================
                   2. FILE NOT IN CACHE
                   TRY INTERNET
                   ============================================
                */

                return fetch(request)

                    .then(networkResponse => {

                        /*
                           Save successful same-origin
                           responses into cache.
                        */

                        if (
                            networkResponse &&
                            networkResponse.ok &&
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

                                })

                                .catch(error => {

                                    console.warn(
                                        "[BoardingPay SW] Dynamic cache error:",
                                        error
                                    );

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => {

                        /*
                           ====================================
                           OFFLINE FALLBACK
                           ====================================
                        */

                        if (
                            request.mode === "navigate" ||
                            request.destination === "document"
                        ) {

                            return caches.match(
                                "./index.html"
                            )

                            .then(indexPage => {

                                if (indexPage) {

                                    return indexPage;

                                }


                                /*
                                   If even index.html is not
                                   cached, show an offline page.
                                */

                                return new Response(
                                    `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>BoardingPay Offline</title>

</head>

<body
    style="
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 40px;
        background: #f5fbff;
        color: #123f68;
    "
>

<h2>BoardingPay</h2>

<p>
    You are currently offline.
</p>

<p>
    This page has not been cached yet.
</p>

<p>
    Connect to the internet once,
    open this page,
    then try Offline mode again.
</p>

</body>

</html>
                                    `,
                                    {
                                        status: 503,

                                        headers: {
                                            "Content-Type":
                                                "text/html; charset=UTF-8"
                                        }

                                    }
                                );

                            });

                        }


                        /*
                           Non-page resources.
                        */

                        return new Response(

                            "BoardingPay is offline. This resource is not cached.",

                            {
                                status: 503,

                                statusText: "Offline",

                                headers: {
                                    "Content-Type":
                                        "text/plain; charset=UTF-8"
                                }

                            }

                        );

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


    /* ========================================================
       SKIP WAITING
    ======================================================== */

    if (
        event.data.action ===
        "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }


    /* ========================================================
       CLEAR CACHE
    ======================================================== */

    if (
        event.data.action ===
        "CLEAR_CACHE"
    ) {

        event.waitUntil(

            caches.keys()

                .then(cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

                                return caches.delete(
                                    cacheName
                                );

                            }
                        )

                    );

                })

                .then(() => {

                    console.log(
                        "[BoardingPay SW] All caches cleared."
                    );

                })

        );

    }


    /* ========================================================
       CACHE APP AGAIN
    ======================================================== */

    if (
        event.data.action ===
        "CACHE_APP"
    ) {

        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(async cache => {

                    for (
                        const file of APP_FILES
                    ) {

                        try {

                            const response =
                                await fetch(

                                    new Request(
                                        file,
                                        {
                                            cache:
                                                "no-store"
                                        }
                                    )

                                );

                            if (response.ok) {

                                await cache.put(
                                    file,
                                    response.clone()
                                );

                                console.log(
                                    "[BoardingPay SW] Re-cached:",
                                    file
                                );

                            }

                        } catch (error) {

                            console.warn(
                                "[BoardingPay SW] Re-cache failed:",
                                file
                            );

                        }

                    }

                })

        );

    }

});
