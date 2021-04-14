const version = 'v1.25';
const staticCacheName = 'static-cache-courses-'+ version;
const offlinePage = "./offline.html";
const assets = [
	offlinePage,
	"./",
	"./index.php",
	// PWA
	"./manifest.webmanifest",
	'./sw.js',
	// CSS
	"./styles/parametres.css",
	"./styles/popups.css",
	"./styles/forms.css",
	"./styles/modernForms.css",
	"./styles/style.css",
	"./styles/menus.css",
	"./styles/switches.css",
	"./styles/preload.css",
	"./styles/auth.css",
	"./styles/mainPanel.css",
	// MODULES
	"./modules/js/app.js",
	"./modules/js/controls.js",
	"./modules/js/course.js",
	"./modules/js/groupe.js",
	"./modules/js/structure.js",
	"./modules/js/generate.js",
	"./modules/js/tools.js",
	"./modules/js/index.js",
	"./modules/js/math.js",
	"./modules/js/pwa.js",
	"./modules/js/requests.js",
	"./modules/js/storage.js",
	"./modules/js/touch.js",
	"./modules/js/UI.js",
	"./modules/js/offline.js",
	// RSC
	"./images/logo72.png",
	"./images/logo128.png",
	"./images/logo144.png",
	"./images/logo152.png",
	"./images/logo192.png",
	"./images/logo384.png",
	"./images/logo512.png",
	"./images/logo_bg.png",
	"./images/logo_bt.png",
	"./images/logo_md.png",
	"./images/logo_tp.png",
	"./images/buy.webp",
	"./images/melons.webp",
	"./images/etalage.webp",
	"./images/legumes.webp",
	"./images/logos/android/androidicon144.png",
	// SCRIPTS
	"./scripts/chart.js",
	"./scripts/load/loadHandler.js",
	"./scripts/load/loadCss.js",
	"./scripts/load/onLoadCss.js",

	// ONLINE CDN
	'https://code.jquery.com/jquery-3.5.1.min.js',
	'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css',
	'https://static2.sharepointonline.com/files/fabric/assets/icons/fabricmdl2icons-3.54.woff'
];


function postMessageToCLients(type, payload = {}){
	self.clients.matchAll({
		includeUncontrolled: true,
		type: 'window'
	}).then(clients => {
		clients.forEach(client => client.postMessage({type, payload}))
	})
}


self.importScripts("./scripts/sw/idb.js");
self.importScripts("./scripts/sw/syncCourses.js");


self.addEventListener("message", event => {
	// console.log("Service Worker recieved a message", event);
	if(event.data){
		if (event.data.type === "DELETEDB"){
			event.waitUntil((async () => {
				IndexedDbStorage.closeIDB()
				.then(() => IndexedDbStorage.deleteDb())
				.then(() => postMessageToCLients("DISCONNECT"))
				.catch(err => console.error(err));
			})());
		}

		else if (event.data.action === 'skipWaiting') {
			self.skipWaiting();
		}
	}
});


self.addEventListener('sync', function(event) {
	switch(event.tag){
		case 'pushOnline':
			self.registration.showNotification("De nouveau en ligne !", {body: "Vous pouvez maintenant continuer à acheter des articles.", icon: "logo512.png", vibrate: [300, 200, 100]});
			break;
		case "syncCourses":
			event.waitUntil(syncCourses());
			break;
	}
});


// Install Service Worker
self.addEventListener('install', evt => {
	evt.waitUntil(
		caches.open(staticCacheName).then(cache => {
			cache.addAll(assets);
		})
	);
	
});

// Activate Event
self.addEventListener('activate', evt => {
	evt.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => key !== staticCacheName)
				.map(key => caches.delete(key))
			)
		})
	);
});

// Fetch Event
self.addEventListener('fetch', evt => {

	if(evt.request.url.includes('/serveur')){
		evt.respondWith(coursesServerResponse(evt));
	} else {
		evt.respondWith(
			caches.match(evt.request).then(cacheRes => {
				return cacheRes || fetch(evt.request);
			}).catch(() => {
				if (evt.request.url.indexOf('.html') > -1 || evt.request.url.indexOf('.php') > -1 || evt.request.url[evt.request.url.length-1] === '/') {
					return caches.match(offlinePage);
				}
			})
		);
	}

});
