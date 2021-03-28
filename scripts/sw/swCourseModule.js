let getVersionPort;
let count = 0;

self.addEventListener("message", event => {
	if(event.data){
		if (event.data.type === 'INIT_PORT') {
			getVersionPort = event.ports[0];
		}/*  else if (event.data.type === "FETCH_DATA"){
			event.waitUntil(fetchData());
		} */
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