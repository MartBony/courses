import App from './app.js';

var deferredPrompt;

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
}

export { addSiteCache, initPwaEvents, deferredPrompt };