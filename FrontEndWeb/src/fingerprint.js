import FingerprintJS from "@fingerprintjs/fingerprintjs";

// Initialize an agent at application startup.
// fpPromise.then((fp) => fp.get()).then((result) => console.log(result));
export let fpPromise = FingerprintJS.load({});