/* ============================================================
   BOARDINGPAY SERVICE WORKER
   OFFLINE-FIRST
============================================================ */

const CACHE_NAME = "boardingpay-v2";


/* ============================================================
   ACTUAL BOARDINGPAY FILES
============================================================ */

const APP_FILES = [

    /* MAIN */
    "./",
    "./index.html",
    "./get-started.html",
    "./login.html",

    /* ADMIN */
    "./admin-register.html",
    "./create-account.html",
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

    /* OTHER */
    "./profile.html",
    "./settings.html",
    "./history.html",
    "./announcements.html",
    "./contact.html",
    "./forgot-password.html",

    /* CSS */
    "./style.css",

   

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
                   Cache files individually.

                   This prevents one missing file from
                   breaking the entire installation.
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
                                "[BoardingPay SW] Could not cache:",
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
                            "[BoardingPay SW] Cache error:",
                            file,
                            error
                        );

                    }

                }

                console.log(
                    "[BoardingPay SW] Installation complete."
                );

            })

            .then(() => {

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


    /* Only GET requests */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                /*
                   ==========================================
                   CACHE HIT
                   ==========================================
                */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /*
                   ==========================================
                   TRY NETWORK
                   ==========================================
                */

                return fetch(request)

                    .then(networkResponse => {

                        /*
                           Cache successful same-origin
                           resources dynamically.
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
                           ==================================
                           OFFLINE DOCUMENT FALLBACK
                           ==================================
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
                                   Emergency offline page
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
        font-family:Arial,sans-serif;
        text-align:center;
        padding:40px;
        background:#f5fbff;
        color:#123f68;
    "
>

<h2>BoardingPay</h2>

<p>You are currently offline.</p>

<p>
Please connect to the internet once
so this page can be cached.
</p>

</body>

</html>
                                    `,

                                    {
                                        status: 200,

                                        headers: {
                                            "Content-Type":
                                                "text/html; charset=UTF-8"
                                        }
                                    }

                                );

                            });

                        }


                        /*
                           ==================================
                           OFFLINE NON-DOCUMENT RESOURCE
                           ==================================
                        */

                        return new Response(
                            "",
                            {
                                status: 200
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
       FORCE ACTIVATION
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
                        "[BoardingPay SW] Cache cleared."
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
