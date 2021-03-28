const syncCourses = () => {
	IndexedDbStorage.getAll("requests").then(requests => {
		Promise.all(requests.map(request => {
			let itemData;
			switch(request.type){ // Add catch statements
				case "preview":
					return fetcher({
						url: "/courses/serveur/push.php",
						method: "POST",
						data: {
							submitPreview: true,
							titre: request.data.titre,
							groupe: request.data.groupe
						}
					})
					.then(data => {
						itemData = data
						return IndexedDbStorage.put("items", {type: "preview", course: data.course, color: data.color, id: data.id, prix: data.prix, titre: data.titre})
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: {type: "updPreview", id: request.reqId, item: itemData} }) });
					break;
				case "article":
					return fetcher({
						url: "/courses/serveur/push.php",
						method: "POST",
						data: { // Send article
							submitArticle: true,
							titre: request.data.titre,
							prix: request.data.prix,
							groupe: request.data.groupe
						}
					})
					.then(data => {
						itemData = data;
						return IndexedDbStorage.put("items", {type: "article", course: data.course, color: data.color, id: data.id, prix: data.prix, titre: data.titre})
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: {type: "updArticle", id: request.reqId, item: itemData} }) });
					break;
				case "delPreview":
					return fetcher({
						url: "/courses/serveur/push.php",
						method: "POST",
						data: { // Send article
							deletePreview: true,
							id: request.data.id,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						return IndexedDbStorage.delete("items", request.data.id)
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId));
					break;
				case "delArticle":
					return fetcher({
						url: "/courses/serveur/push.php",
						method: "POST",
						data: { // Send article
							deleteArticle: true,
							id: request.data.id,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						itemData = res;
						return IndexedDbStorage.delete("items", request.data.id)
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: {type: "deleteArticleSetTotal", prix: itemData.prix} }) });
					break;
				case "buy":
					fetcher({
						method: "POST",
						url: "/courses/serveur/push.php",
						data: {
							buyPreview: true,
							id: request.data.id,
							prix: request.data.prix,
							groupe: request.data.groupe
						}
					})
					.then(article => {
						itemData = article;
						IndexedDbStorage.put("items", {...article, type: "article"});
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: {type: "buy", id: request.reqId, item: itemData} }) });
					break;
			}
		}));
	});
};/* ,
fetchData = () => {
	fetcher({
		method: 'POST',
		url: '/courses/serveur/structure.php'
	})
	.catch(err => {
		if(getVersionPort) getVersionPort.postMessage({ payload: { type: "ERROR", details: "FetchError"} })
		console.log(err); 
	})
	.then(data => {
		if(data && data.nom && data.id && data.groupes){
			return IndexedDbStorage.put("structures", { groupes: data.groupes, nom: data.nom, id: data.id })
		}
	})
	.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: { type: "DONE", details: "Structure" } }) })
	.catch(err => { 
		if(getVersionPort) getVersionPort.postMessage({ payload: { type: "ERROR", details: "DatabaseError"} })
		console.log(err);
	});
} */

async function coursesServerOfflineResponse(event){
	event.respondWith((async () => {
		try {
			const preloadResponse = await event.preloadResponse;
			if (preloadResponse) {
				return preloadResponse;
			}

			const networkResponse = await fetch(event.request);
			return networkResponse;
		} catch (error) {
			console.log('Fetch failed; returning offline page instead.', error);

			/* const cache = await caches.open(staticCacheName); 
			const cachedResponse = await cache.match(offlineServerRes);
			return cachedResponse;*/
			return new Response('{"status":"offline"}', { headers: { 'Content-Type': 'application/json'}});
		}
	  })());
}


function fetcher(reqData){
	return fetch(reqData.url, {
		method: reqData.method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: reqData.data ? new URLSearchParams(reqData.data) : null,
	})
	.then(res => res.json());
}

function deleteItemFromIDB(id){
	return IndexedDbStorage.delete("items", id);
}