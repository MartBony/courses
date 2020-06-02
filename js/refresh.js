let deferredPrompt;

// PWA custom install

window.addEventListener('beforeinstallprompt', (e) => {
	// Prevent the mini-infobar from appearing on mobile
	e.preventDefault();
	// Stash the event so it can be triggered later.
	deferredPrompt = e;
	// Update UI notify the user they can install the PWA
	//app.showInstall(500);
});

caches.open('site-course').then(function(cache) { // Cache static parts of site
	fetch('coursesCache.json').then(function(response) {
			// get-article-urls returns a JSON-encoded array of resource URLs that a given article depends on
			return response.json();
		}).then(function(urls) {
	cache.addAll(urls);
	});
});

$('.install button').on('click', (e) => {
	// Hide the app provided install promotion
	app.hideInstall();
	// Show the install prompt
	deferredPrompt.prompt();
	// Wait for the user to respond to the prompt
	deferredPrompt.userChoice.then((choiceResult) => {
		if (choiceResult.outcome === 'accepted') {
			console.log('User accepted the install prompt');
		} else {
			console.log('User dismissed the install prompt');
		}
	})
});

function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}

function mod(n, m) {
	return ((n % m) + m) % m;
}

function requestData(dest, refresh, hasCached = false, errMSG = `Vous êtes hors ligne, vous pouvez utiliser l'application consultation seulement`){
	var networkUpdate = fetch(dest).then(function(res) {
		return res.json();
	}).then(function(data) {
		networkDataReceived = true;
		console.log('Network data fetched:', data);
		app.updatePage(data, true, refresh, true);
	}).catch(err => {
		if (!hasCached) {
			course.offlineMsg(err, errMSG);
			$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--NetworkTower');
			setTimeout(function(){
				$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--NetworkTower');
			},2000);
		}
	});
}


function requestStorage(index){
	var storageUpdate = (Storage.getItem('items') || new Array(0));
	if (index == -1) {
		storageUpdate.forEach((el, i) => {
			if (el.idCourse > index) {
				index = el.idCourse;
			}
		});
	}
	console.log('Storage data fetched:', storageUpdate.filter(el => el.idCourse == index)[0]);
	return storageUpdate.filter(el => el.idCourse == index)[0];
}