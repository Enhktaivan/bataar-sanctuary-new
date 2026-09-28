/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "original.css",
    "revision": "d16e9910dc66a5529d516d24e75f57af"
  }, {
    "url": "og-image.jpg",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "index.html",
    "revision": "36bff95fa8aaf0e459d7b98f446b9948"
  }, {
    "url": "icon-512.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "icon-192.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "favicon.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "404.html",
    "revision": "11ac073e6ecea6a0d80744368834e606"
  }, {
    "url": "assets/therizinosaurus_giant_claws_1788079823772-2olsDg4h.jpg",
    "revision": null
  }, {
    "url": "assets/tarbosaurus_full_head_1788078749993-C-9-IqVw.jpg",
    "revision": null
  }, {
    "url": "assets/tarbosaurus_bataar_live_1788078516313-Bp8Qb2Vy.jpg",
    "revision": null
  }, {
    "url": "assets/standard_room_enhanced_v2-Cte5X1f1.png",
    "revision": null
  }, {
    "url": "assets/snow_leopard_bg_art_1788085770307-DMCP2JAN.jpg",
    "revision": null
  }, {
    "url": "assets/saurolophus_specimen_art_1788079507112-Baa0f4zi.jpg",
    "revision": null
  }, {
    "url": "assets/oviraptor_perched_log_1788080865254-BC2CuqN1.jpg",
    "revision": null
  }, {
    "url": "assets/luxury_room_enhanced_v2-BzqG-Joq.png",
    "revision": null
  }, {
    "url": "assets/khongor_sand_dunes_1788058870269-0CmNYMEg.jpg",
    "revision": null
  }, {
    "url": "assets/khermen_tsav_deep_gobi_real-zHe1907n.jpg",
    "revision": null
  }, {
    "url": "assets/khermen_tsav_canyon_1788058798021-B5rTud00.jpg",
    "revision": null
  }, {
    "url": "assets/index-CoDafsRC.js",
    "revision": null
  }, {
    "url": "assets/index-CIEIzaD_.css",
    "revision": null
  }, {
    "url": "assets/index-BbWeFLaX.css",
    "revision": null
  }, {
    "url": "assets/index-BX3-k7-k.js",
    "revision": null
  }, {
    "url": "assets/gobi_snow_leopard_ridge_1788084150553-D7fO5MDL.jpg",
    "revision": null
  }, {
    "url": "assets/gobi_saxaul_dunes_1788058828050-DpE09Jqs.jpg",
    "revision": null
  }, {
    "url": "assets/gobi_camel_herd_1788058813665-DdEmpZHB.jpg",
    "revision": null
  }, {
    "url": "assets/fighting_dinosaurs_clash_1788080430792-Dvd4BIWY.jpg",
    "revision": null
  }, {
    "url": "assets/family_suite_twin_room_1788610237421-BWGtYYSf.jpg",
    "revision": null
  }, {
    "url": "assets/family_suite_master_real.png",
    "revision": null
  }, {
    "url": "assets/family_suite_master_new.jpg",
    "revision": null
  }, {
    "url": "assets/family_suite_master_bedroom_1788610220821-DLG8f7XB.jpg",
    "revision": null
  }, {
    "url": "assets/family_suite_bathroom_1788610251261-BkFZYOtI.jpg",
    "revision": null
  }, {
    "url": "assets/deinocheirus_wetland_habitat_1788081328338-D0Cc9-8h.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_sanctuary_aerial_map-DHeLEgKU.png",
    "revision": null
  }, {
    "url": "assets/bataar_official_logo_1788064678288-DQd99eoj.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_museum_skeleton_1788064922332-Cw5LzzSD.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_deluxe_room_real-C4_RGamD.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_camp_luxury_ger_1788093244411-zxHMXVn2.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_camp_introduction_panorama-CM4jVphZ.png",
    "revision": null
  }, {
    "url": "assets/bataar_camp_exact_official-L9Zb7ELd.jpg",
    "revision": null
  }, {
    "url": "assets/bataar_camp_camels_original-DRGx3dPh.jpg",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "favicon.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "icon-192.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "icon-512.png",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "og-image.jpg",
    "revision": "e3a0a3d9e87de232be1c3cd980744627"
  }, {
    "url": "manifest.webmanifest",
    "revision": "f8c0b1d05635ef1fdb1f40c17b5b02ea"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "unsplash-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
