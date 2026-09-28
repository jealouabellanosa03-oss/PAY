/* ============================================================
   BOARDINGPAY SERVICE WORKER
   OFFLINE-FIRST
   GitHub Pages Compatible
============================================================ */

const CACHE_NAME = "boardingpay-v3";


/* ============================================================
   ACTUAL FILES IN YOUR BOARDINGPAY FOLDER
============================================================ */

const APP_FILES = [

    /* =========================
       MAIN PAGES
    ========================= */

    "./",
    "./index.html",
    "./get-started.html",
    "./login.html",


    /* =========================
       ADMIN
    ========================= */

    "./admin-register.html",
    "./create-account.html",
    "./admin-dashboard.html",


    /* =========================
       LANDLORD
    ========================= */

    "./landlord-register.html",
    "./landlord-dashboard.html",


    /* =========================
       TENANT
    ========================= */

    "./tenant-register.html",
    "./tenant-dashboard.html",


    /* =========================
       PAYMENTS
    ========================= */

    "./paymentmethod.html",
    "./payment-details.html",
    "./payment-success.html",


    /* =========================
       OTHER PAGES
    ========================= */

    "./profile.html",
    "./settings.html",
    "./history.html",
    "./announcements.html",
    "./contact.html",
    "./forgot-password.html",


    /* =========================
       CSS
    ========================= */

    "./style.css",


    /* =========================
       JAVASCRIPT
    ========================= */

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
                   Cache files one by one.

                   This is safer than cache.addAll().
                   If one file is missing, the entire
                   Service Worker installation will NOT fail.
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

                    }

                    catch (error) {

                        console.warn(
                            "[BoardingPay SW] Cache failed:",
                            file,
                            error
                        );

                    }

                }


                console.log(
                    "[BoardingPay SW] All available files processed."
                );

            })


            .then(() => {

                /*
                   Activate immediately.
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
                                "[BoardingPay SW] Deleting old cache:",
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
                   Take control of currently opened pages.
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
   FETCH HANDLER
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


                /* =================================================
                   1. FILE IS ALREADY CACHED
                ================================================= */

                if (cachedResponse) {

                    return cachedResponse;

                }


                /* =================================================
                   2. IMAGE REQUEST
                   -------------------------------------------------
                   This specifically handles the image error you
                   are seeing:

                   /image/Screenshot 2026-09-23 214808.png
                ================================================= */

                if (
                    request.destination === "image"
                ) {

                    return fetch(request)

                        .then(networkResponse => {

                            /*
                               If the image exists online,
                               save it for future offline use.
                            */

                            if (
                                networkResponse &&
                                networkResponse.ok
                            ) {

                                const imageCopy =
                                    networkResponse.clone();


                                caches.open(CACHE_NAME)

                                    .then(cache => {

                                        cache.put(
                                            request,
                                            imageCopy
                                        );

                                    })

                                    .catch(error => {

                                        console.warn(
                                            "[BoardingPay SW] Image cache error:",
                                            error
                                        );

                                    });

                            }


                            return networkResponse;

                        })


                        .catch(() => {

                            /*
                               =====================================
                               OFFLINE IMAGE FALLBACK
                               =====================================

                               Instead of returning a network error,
                               return a valid transparent image.

                               This prevents the FetchEvent from
                               returning a rejected/network error.
                            */

                            const transparentSVG = `
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1"
                                    height="1"
                                    viewBox="0 0 1 1"
                                >
                                    <rect
                                        width="1"
                                        height="1"
                                        fill="transparent"
                                    />
                                </svg>
                            `;


                            return new Response(
                                transparentSVG,
                                {
                                    status: 200,

                                    headers: {
                                        "Content-Type":
                                            "image/svg+xml"
                                    }
                                }
                            );

                        });

                }


                /* =================================================
                   3. NORMAL REQUEST
                ================================================= */

                return fetch(request)

                    .then(networkResponse => {


                        /*
                           Cache successful same-origin resources.
                        */

                        if (
                            networkResponse &&
                            networkResponse.ok &&
                            networkResponse.type === "basic"
                        ) {

                            const responseCopy =
                                networkResponse.clone();


                            caches.open(CACHE_NAME)

                                .then(cache => {

                                    return cache.put(
                                        request,
                                        responseCopy
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


                        /* =================================================
                           4. OFFLINE PAGE FALLBACK
                        ================================================= */

                        if (
                            request.mode === "navigate" ||
                            request.destination === "document"
                        ) {


                            return caches.match(
                                "./index.html"
                            )

                            .then(indexPage => {


                                /*
                                   If index.html is cached,
                                   return it.
                                */

                                if (indexPage) {

                                    return indexPage;

                                }


                                /*
                                   Emergency offline page.
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

    <title>
        BoardingPay Offline
    </title>

</head>


<body
    style="
        margin:0;
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Arial,sans-serif;
        background:#f5f7fa;
        color:#183b56;
        text-align:center;
    "
>


    <div
        style="
            max-width:400px;
            padding:30px;
        "
    >

        <h2>
            BoardingPay
        </h2>


        <p>
            You are currently offline.
        </p>


        <p>
            Please connect to the internet once
            to cache this page.
        </p>

    </div>


</body>

</html>
                                    `,

                                    {
                                        status:200,

                                        headers:{
                                            "Content-Type":
                                                "text/html; charset=UTF-8"
                                        }
                                    }

                                );

                            });

                        }


                        /* =================================================
                           5. OTHER OFFLINE RESOURCES
                        ================================================= */

                        return new Response(
                            "",
                            {
                                status:200,

                                headers:{
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


    /* =========================================================
       SKIP WAITING
    ========================================================= */

    if (
        event.data.action ===
        "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }


    /* =========================================================
       CLEAR ALL BOARDINGPAY CACHE
    ========================================================= */

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


    /* =========================================================
       CACHE APP AGAIN
    ========================================================= */

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

                        }

                        catch (error) {

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
