import App from './app.js';

let deferredPrompt,
	newWorker;

function addSiteCache(nom, src){
	caches.open(nom).then(function(cache) { // Cache static parts of site
		fetch(src).then(function(response) {
				// get-article-urls returns a JSON-encoded array of resource URLs that a given article depends on
				return response.json();
			}).then(function(urls) {
		cache.addAll(urls);
		});
	});
}

function initPwaEvents(){

	// Install app
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		//App.showInstall(500);
	});
	
	$('.install button').on('click', (e) => {
		App.hideInstall();
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				console.log('User accepted the install prompt');
			} else {
				console.log('User dismissed the install prompt');
			}
		})
	});

	// Update app - https://deanhume.com/displaying-a-new-version-available-progressive-web-app/
	document.querySelector('#update button').addEventListener('click', function(){
		newWorker.postMessage({ action: 'skipWaiting' });
	});

	navigator.serviceWorker.ready.then(reg => {
		reg.addEventListener('updatefound', () => {
			newWorker = reg.installing;
			newWorker.addEventListener('statechange', () => {
				switch (newWorker.state) {
					case 'installed':
					if (navigator.serviceWorker.controller) {
						let notification = document.getElementById('update');
						notification.className = 'opened';
					}
					break;
				}
			});
		});
	});

	let refreshing;
	navigator.serviceWorker.addEventListener('controllerchange', function () {
		if (refreshing) return;
		window.location.reload();
		refreshing = true;
	});
	
}

export { addSiteCache, initPwaEvents, deferredPrompt };