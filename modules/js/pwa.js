import App from './app.js';
import UI from './UI.js';

let deferredPrompt,
	newWorker;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./../sw.js')
	.then((reg) => {
		console.log('Service Worker installé avec succès');
	}).catch((err) => console.log('Failed Registering Service Worker', err));
}

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
		if(window.innerWidth < 900){
			UI.showInstall(500);
		}
	});
	
	$('.install button').on('click', (e) => {
		UI.hideInstall();
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
	navigator.serviceWorker.ready.then(reg => {
		reg.addEventListener('updatefound', () => {
			newWorker = reg.installing;
			newWorker.addEventListener('statechange', () => {
				switch (newWorker.state) {
					case 'installed':
					if (navigator.serviceWorker.controller) {
						UI.message("Une mise à jour est displonible", "Installer en un click ou laisser l'application s'en occuper plus tard", [
							{ texte: "Mettre à jour", action: () => newWorker.postMessage({ action: 'skipWaiting' }) },
							{ texte:"Fermer", action : () => UI.closeMessage(), class: 'greyish'}
						]);
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