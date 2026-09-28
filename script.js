document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =====================================================
       COMMON STORAGE
    ===================================================== */

    const ACCOUNTS_KEY = "boardingPayAccounts";


    /* =====================================================
       HELPERS
    ===================================================== */

    function getAccounts() {

        try {

            const accounts = JSON.parse(
                localStorage.getItem(ACCOUNTS_KEY) || "[]"
            );

            return Array.isArray(accounts)
                ? accounts
                : [];

        } catch (error) {

            return [];

        }

    }


    function saveAccounts(accounts) {

        localStorage.setItem(
            ACCOUNTS_KEY,
            JSON.stringify(accounts)
        );

    }


    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }


    function getDashboard(role) {

        role = normalize(role);

        if (role === "admin") {
            return "admin-dashboard.html";
        }

        if (role === "landlord") {
            return "landlord-dashboard.html";
        }

        if (role === "tenant") {
            return "tenant-dashboard.html";
        }

        return "login.html";

    }


    /* =====================================================
       PASSWORD SHOW / HIDE
       Works with:
       .password-toggle
       #passwordToggle
    ===================================================== */

    const passwordToggles =
        document.querySelectorAll(".password-toggle");


    passwordToggles.forEach(function (toggle) {

        toggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const targetId =
                    toggle.getAttribute("data-target");

                if (!targetId) {
                    return;
                }

                const passwordInput =
                    document.getElementById(targetId);

                if (!passwordInput) {
                    return;
                }


                if (passwordInput.type === "password") {

                    passwordInput.type = "text";

                    toggle.textContent = "🙈";

                    toggle.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    passwordInput.type = "password";

                    toggle.textContent = "👁";

                    toggle.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    });


    /* =====================================================
       LOGIN PASSWORD TOGGLE
       For login.html
    ===================================================== */

    const loginPasswordToggle =
        document.getElementById("passwordToggle");


    if (
        loginPasswordToggle &&
        !loginPasswordToggle.classList.contains("password-toggle")
    ) {

        loginPasswordToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const passwordInput =
                    document.getElementById("password");

                if (!passwordInput) {
                    return;
                }


                if (passwordInput.type === "password") {

                    passwordInput.type = "text";

                    loginPasswordToggle.textContent = "🙈";

                    loginPasswordToggle.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    passwordInput.type = "password";

                    loginPasswordToggle.textContent = "👁";

                    loginPasswordToggle.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }


    /* =====================================================
       REGISTRATION VALIDATION
    ===================================================== */

    function validateRegistrationFields(fields) {

        for (const value of Object.values(fields)) {

            if (!String(value || "").trim()) {

                alert("Please complete all fields.");

                return false;

            }

        }


        if (fields.email !== undefined) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(fields.email)) {

                alert(
                    "Please enter a valid email address."
                );

                return false;

            }

        }


        if (
            fields.password !== undefined &&
            fields.password.length < 6
        ) {

            alert(
                "Password must be at least 6 characters."
            );

            return false;

        }


        if (
            fields.password !== undefined &&
            fields.password !== fields.confirmPassword
        ) {

            alert("Passwords do not match.");

            return false;

        }


        return true;

    }


    /* =====================================================
       PHONE VALIDATION
       Must:
       - Start with 09
       - Have exactly 11 digits
    ===================================================== */

    function validatePhone(phone) {

        return /^09\d{9}$/.test(phone);

    }


    /* =====================================================
       LOGIN MESSAGE
    ===================================================== */

    function showLoginMessage(text, type) {

        const loginMessage =
            document.getElementById("loginMessage");


        if (!loginMessage) {

            alert(text);

            return;

        }


        loginMessage.textContent = text;

        loginMessage.className = type;

    }


    /* =====================================================
       SAVE LOGIN SESSION
    ===================================================== */

    function saveLoginSession(account) {

        const role =
            normalize(
                account.role || account.accountType
            );


        /*
         * MAIN CURRENT USER
         */

        localStorage.setItem(
            "boardingPayCurrentUser",
            JSON.stringify(account)
        );


        /*
         * COMPATIBILITY KEYS
         */

        localStorage.setItem(
            "currentUser",
            JSON.stringify(account)
        );

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(account)
        );


        /*
         * LOGIN FLAGS
         */

        localStorage.setItem(
            "boardingPayLoggedIn",
            "true"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        localStorage.setItem(
            "loggedIn",
            "true"
        );


        /*
         * USER INFORMATION
         */

        localStorage.setItem(
            "currentUserType",
            role
        );

        localStorage.setItem(
            "userRole",
            role
        );

        localStorage.setItem(
            "accountType",
            role
        );

        localStorage.setItem(
            "loggedInName",
            account.fullName || ""
        );

        localStorage.setItem(
            "loggedInEmail",
            account.email || ""
        );

        localStorage.setItem(
            "loggedInPhone",
            account.phone || ""
        );


        /*
         * ROLE-SPECIFIC SESSION
         */

        if (role === "admin") {

            localStorage.setItem(
                "currentAdmin",
                JSON.stringify(account)
            );

        }


        if (role === "landlord") {

            localStorage.setItem(
                "currentLandlord",
                JSON.stringify(account)
            );

        }


        if (role === "tenant") {

            localStorage.setItem(
                "currentTenant",
                JSON.stringify(account)
            );

        }


        /*
         * REMOVE OLD PENDING LOGIN DATA
         */

        localStorage.removeItem(
            "pendingLoginRole"
        );

        localStorage.removeItem(
            "pendingLoginIdentifier"
        );

        localStorage.removeItem(
            "boardingPayPendingLogin"
        );

    }


    /* =====================================================
       INDEX / LANDING PAGE
    ===================================================== */

    const getStartedBtn =
        document.getElementById("getStartedBtn");

    const loginBtn =
        document.getElementById("loginBtn");


    if (getStartedBtn) {

        getStartedBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "create-account.html";

            }
        );

    }


    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "login.html";

            }
        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const roleEl =
                    document.getElementById("role");

                const identifierEl =
                    document.getElementById(
                        "loginIdentifier"
                    );

                const passwordEl =
                    document.getElementById(
                        "password"
                    );


                if (
                    !identifierEl ||
                    !passwordEl
                ) {

                    return;

                }


                const selectedRole =
                    roleEl
                        ? normalize(roleEl.value)
                        : "";


                const identifier =
                    normalize(
                        identifierEl.value
                    );


                const password =
                    passwordEl.value;


                /* -----------------------------------------
                   VALIDATE INPUT
                ----------------------------------------- */

                if (!selectedRole) {

                    showLoginMessage(
                        "Please select your account type.",
                        "error"
                    );

                    return;

                }


                if (!identifier) {

                    showLoginMessage(
                        "Please enter your email or phone number.",
                        "error"
                    );

                    return;

                }


                if (!password) {

                    showLoginMessage(
                        "Please enter your password.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   GET REGISTERED ACCOUNTS
                ----------------------------------------- */

                const accounts =
                    getAccounts();


                /* -----------------------------------------
                   FIND ACCOUNT

                   Matches:
                   - Email
                   - Phone
                   - Identifier
                   - Username

                   AND:
                   - Same account role
                ----------------------------------------- */

                const account =
                    accounts.find(function (item) {

                        const accountRole =
                            normalize(
                                item.role ||
                                item.accountType
                            );


                        const accountEmail =
                            normalize(
                                item.email
                            );


                        const accountPhone =
                            normalize(
                                item.phone
                            );


                        const accountIdentifier =
                            normalize(
                                item.identifier
                            );


                        const accountUsername =
                            normalize(
                                item.username
                            );


                        const identifierMatch =
                            identifier === accountEmail ||
                            identifier === accountPhone ||
                            identifier === accountIdentifier ||
                            identifier === accountUsername;


                        const roleMatch =
                            selectedRole === accountRole;


                        return (
                            identifierMatch &&
                            roleMatch
                        );

                    });


                /* -----------------------------------------
                   ACCOUNT NOT FOUND
                ----------------------------------------- */

                if (!account) {

                    showLoginMessage(
                        "Account not found. Please use the same email/phone, password, and account type you used when creating your account.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   PASSWORD CHECK
                ----------------------------------------- */

                if (
                    String(account.password) !==
                    String(password)
                ) {

                    showLoginMessage(
                        "Incorrect password.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   LOGIN SUCCESS
                ----------------------------------------- */

                saveLoginSession(account);


                showLoginMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                /*
                 * DIRECT ROLE-BASED REDIRECT
                 *
                 * No timeout needed.
                 */

                const dashboard =
                    getDashboard(account.role);


                window.location.replace(
                    dashboard
                );

            }
        );

    }


    /* =====================================================
       CREATE ACCOUNT PAGE
    ===================================================== */

    const createBackBtn =
        document.getElementById("backBtn");

    const tenantBtn =
        document.getElementById("tenantBtn");

    const landlordBtn =
        document.getElementById("landlordBtn");

    const adminBtn =
        document.getElementById("adminBtn");


    if (createBackBtn) {

        createBackBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "login.html";

            }
        );

    }


    if (tenantBtn) {

        tenantBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "tenant-register.html";

            }
        );

    }


    if (landlordBtn) {

        landlordBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "landlord-register.html";

            }
        );

    }


    if (adminBtn) {

        adminBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "admin-register.html";

            }
        );

    }


    /* =====================================================
       TENANT BACK
    ===================================================== */

    const tenantBackBtn =
        document.getElementById(
            "tenantBackBtn"
        );


    if (tenantBackBtn) {

        tenantBackBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "create-account.html";

            }
        );

    }


    /* =====================================================
       TENANT REGISTRATION
    ===================================================== */

    const tenantForm =
        document.getElementById(
            "tenantRegistrationForm"
        );


    if (tenantForm) {

        tenantForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!tenantForm.checkValidity()) {

                    tenantForm.reportValidity();

                    return;

                }


                const nameEl =
                    document.getElementById(
                        "tenantName"
                    );

                const emailEl =
                    document.getElementById(
                        "tenantEmail"
                    );

                const phoneEl =
                    document.getElementById(
                        "tenantPhone"
                    );

                const passwordEl =
                    document.getElementById(
                        "tenantPassword"
                    );

                const confirmEl =
                    document.getElementById(
                        "tenantConfirmPassword"
                    );


                if (
                    !nameEl ||
                    !emailEl ||
                    !phoneEl ||
                    !passwordEl ||
                    !confirmEl
                ) {

                    alert(
                        "Some tenant registration fields are missing."
                    );

                    return;

                }


                const name =
                    nameEl.value.trim();

                const email =
                    emailEl.value
                        .trim()
                        .toLowerCase();

                const phone =
                    phoneEl.value.trim();

                const password =
                    passwordEl.value;

                const confirmPassword =
                    confirmEl.value;


                if (
                    !validateRegistrationFields({
                        name,
                        email,
                        phone,
                        password,
                        confirmPassword
                    })
                ) {

                    return;

                }


                if (!validatePhone(phone)) {

                    alert(
                        "Phone number must start with 09 and contain exactly 11 digits."
                    );

                    phoneEl.focus();

                    return;

                }


                const accounts =
                    getAccounts();


                const duplicate =
                    accounts.some(
                        function (account) {

                            return (
                                normalize(
                                    account.email
                                ) === email ||

                                normalize(
                                    account.phone
                                ) === phone
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "This email or phone number is already registered."
                    );

                    return;

                }


                const account = {

                    id:
                        "TENANT-" +
                        Date.now(),

                    fullName:
                        name,

                    identifier:
                        email,

                    email:
                        email,

                    phone:
                        phone,

                    password:
                        password,

                    role:
                        "tenant",

                    accountType:
                        "Tenant",

                    createdAt:
                        new Date().toISOString()

                };


                accounts.push(account);

                saveAccounts(accounts);


                /* -----------------------------------------
                   OLD TENANT DATA
                ----------------------------------------- */

                localStorage.setItem(
                    "tenantName",
                    name
                );

                localStorage.setItem(
                    "tenantEmail",
                    email
                );

                localStorage.setItem(
                    "tenantPhone",
                    phone
                );

                localStorage.setItem(
                    "tenantPassword",
                    password
                );


                /* -----------------------------------------
                   PENDING LOGIN
                ----------------------------------------- */

                localStorage.setItem(
                    "pendingLoginRole",
                    "tenant"
                );

                localStorage.setItem(
                    "pendingLoginIdentifier",
                    email
                );


                alert(
                    "Tenant account created successfully. Please log in using the same email/phone and password."
                );


                window.location.href =
                    "login.html";

            }
        );

    }


    /* =====================================================
       LANDLORD BACK
    ===================================================== */

    const landlordBackBtn =
        document.getElementById(
            "landlordBackBtn"
        );


    if (landlordBackBtn) {

        landlordBackBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "create-account.html";

            }
        );

    }


    /* =====================================================
       LANDLORD REGISTRATION
    ===================================================== */

    const landlordForm =
        document.getElementById(
            "landlordRegistrationForm"
        );


    if (landlordForm) {

        landlordForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!landlordForm.checkValidity()) {

                    landlordForm.reportValidity();

                    return;

                }


                const nameEl =
                    document.getElementById(
                        "landlordName"
                    );

                const emailEl =
                    document.getElementById(
                        "landlordEmail"
                    );

                const phoneEl =
                    document.getElementById(
                        "landlordPhone"
                    );

                const passwordEl =
                    document.getElementById(
                        "landlordPassword"
                    );

                const confirmEl =
                    document.getElementById(
                        "landlordConfirmPassword"
                    );


                if (
                    !nameEl ||
                    !emailEl ||
                    !phoneEl ||
                    !passwordEl ||
                    !confirmEl
                ) {

                    alert(
                        "Some landlord registration fields are missing. Make sure landlordPhone exists in the HTML."
                    );

                    return;

                }


                const name =
                    nameEl.value.trim();

                const email =
                    emailEl.value
                        .trim()
                        .toLowerCase();

                const phone =
                    phoneEl.value.trim();

                const password =
                    passwordEl.value;

                const confirmPassword =
                    confirmEl.value;


                if (
                    !validateRegistrationFields({
                        name,
                        email,
                        phone,
                        password,
                        confirmPassword
                    })
                ) {

                    return;

                }


                if (!validatePhone(phone)) {

                    alert(
                        "Phone number must start with 09 and contain exactly 11 digits."
                    );

                    phoneEl.focus();

                    return;

                }


                const accounts =
                    getAccounts();


                const duplicate =
                    accounts.some(
                        function (account) {

                            return (
                                normalize(
                                    account.email
                                ) === email ||

                                normalize(
                                    account.phone
                                ) === phone
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "This email or phone number is already registered."
                    );

                    return;

                }


                const account = {

                    id:
                        "LANDLORD-" +
                        Date.now(),

                    fullName:
                        name,

                    identifier:
                        email,

                    email:
                        email,

                    phone:
                        phone,

                    password:
                        password,

                    role:
                        "landlord",

                    accountType:
                        "Landlord",

                    createdAt:
                        new Date().toISOString()

                };


                accounts.push(account);

                saveAccounts(accounts);


                /* -----------------------------------------
                   OLD LANDLORD DATA
                ----------------------------------------- */

                localStorage.setItem(
                    "landlordName",
                    name
                );

                localStorage.setItem(
                    "landlordEmail",
                    email
                );

                localStorage.setItem(
                    "landlordPhone",
                    phone
                );

                localStorage.setItem(
                    "landlordPassword",
                    password
                );


                /* -----------------------------------------
                   CURRENT LANDLORD
                ----------------------------------------- */

                localStorage.setItem(
                    "currentLandlord",
                    JSON.stringify(account)
                );


                /* -----------------------------------------
                   PENDING LOGIN
                ----------------------------------------- */

                localStorage.setItem(
                    "pendingLoginRole",
                    "landlord"
                );

                localStorage.setItem(
                    "pendingLoginIdentifier",
                    email
                );


                alert(
                    "Landlord account created successfully. Please log in using the same email/phone and password."
                );


                window.location.href =
                    "login.html";

            }
        );

    }


    /* =====================================================
       ADMIN BACK
    ===================================================== */

    const adminBackBtn =
        document.getElementById(
            "adminBackBtn"
        );


    if (adminBackBtn) {

        adminBackBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "create-account.html";

            }
        );

    }


    /* =====================================================
       ADMIN REGISTRATION
    ===================================================== */

    const adminForm =
        document.getElementById(
            "adminRegistrationForm"
        );


    if (adminForm) {

        adminForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!adminForm.checkValidity()) {

                    adminForm.reportValidity();

                    return;

                }


                const nameEl =
                    document.getElementById(
                        "adminName"
                    );

                const emailEl =
                    document.getElementById(
                        "adminEmail"
                    );

                const usernameEl =
                    document.getElementById(
                        "adminUsername"
                    );

                const passwordEl =
                    document.getElementById(
                        "adminPassword"
                    );

                const confirmEl =
                    document.getElementById(
                        "adminConfirmPassword"
                    );


                if (
                    !nameEl ||
                    !emailEl ||
                    !usernameEl ||
                    !passwordEl ||
                    !confirmEl
                ) {

                    alert(
                        "Some admin registration fields are missing."
                    );

                    return;

                }


                const name =
                    nameEl.value.trim();

                const email =
                    emailEl.value
                        .trim()
                        .toLowerCase();

                const username =
                    usernameEl.value.trim();

                const password =
                    passwordEl.value;

                const confirmPassword =
                    confirmEl.value;


                if (
                    !validateRegistrationFields({
                        name,
                        email,
                        username,
                        password,
                        confirmPassword
                    })
                ) {

                    return;

                }


                /* -----------------------------------------
                   ADMIN MUST USE GMAIL
                ----------------------------------------- */

                const gmailPattern =
                    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


                if (!gmailPattern.test(email)) {

                    alert(
                        "Admin email must be a valid Gmail address."
                    );

                    emailEl.focus();

                    return;

                }


                const accounts =
                    getAccounts();


                const duplicate =
                    accounts.some(
                        function (account) {

                            return (
                                normalize(
                                    account.email
                                ) === email ||

                                normalize(
                                    account.identifier
                                ) === email ||

                                normalize(
                                    account.username
                                ) ===
                                normalize(username)
                            );

                        }
                    );


                if (duplicate) {

                    alert(
                        "This email or username is already registered."
                    );

                    return;

                }


                const account = {

                    id:
                        "ADMIN-" +
                        Date.now(),

                    fullName:
                        name,

                    identifier:
                        email,

                    email:
                        email,

                    username:
                        username,

                    password:
                        password,

                    role:
                        "admin",

                    accountType:
                        "Admin",

                    createdAt:
                        new Date().toISOString()

                };


                accounts.push(account);

                saveAccounts(accounts);


                /* -----------------------------------------
                   OLD ADMIN DATA
                ----------------------------------------- */

                localStorage.setItem(
                    "adminName",
                    name
                );

                localStorage.setItem(
                    "adminEmail",
                    email
                );

                localStorage.setItem(
                    "adminUsername",
                    username
                );

                localStorage.setItem(
                    "adminPassword",
                    password
                );


                /* -----------------------------------------
                   PENDING LOGIN
                ----------------------------------------- */

                localStorage.setItem(
                    "pendingLoginRole",
                    "admin"
                );

                localStorage.setItem(
                    "pendingLoginIdentifier",
                    email
                );


                alert(
                    "Admin account created successfully. Please log in using the same email and password."
                );


                /*
                 * IMPORTANT:
                 * ADMIN DOES NOT GO DIRECTLY
                 * TO DASHBOARD AFTER REGISTRATION.
                 *
                 * USER MUST LOGIN FIRST.
                 */

                window.location.href =
                    "login.html";

            }
        );

    }


    /* =====================================================
       AUTO-FILL LOGIN AFTER REGISTRATION
    ===================================================== */

    const loginPageForm =
        document.getElementById(
            "loginForm"
        );


    if (loginPageForm) {

        const pendingRole =
            localStorage.getItem(
                "pendingLoginRole"
            );


        const pendingIdentifier =
            localStorage.getItem(
                "pendingLoginIdentifier"
            );


        const roleInput =
            document.getElementById(
                "role"
            );


        const identifierInput =
            document.getElementById(
                "loginIdentifier"
            );


        if (
            pendingRole &&
            roleInput
        ) {

            roleInput.value =
                pendingRole;

        }


        if (
            pendingIdentifier &&
            identifierInput
        ) {

            identifierInput.value =
                pendingIdentifier;

        }


        /*
         * DO NOT AUTOMATICALLY LOGIN.
         *
         * User still needs to enter
         * the password.
         */

        localStorage.removeItem(
            "pendingLoginRole"
        );

        localStorage.removeItem(
            "pendingLoginIdentifier"
        );

    }


});