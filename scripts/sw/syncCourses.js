const syncCourses = () => {
	return IndexedDbStorage.getAll("requests").then(requests => {
		return Promise.all(requests.map(request => {
			let itemData;
			switch(request.type){ // Add catch statements
				case "preview":
					return fetcher({
						url: "./serveur/push.php",
						method: "POST",
						data: {
							submitPreview: true,
							titre: request.data.titre,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						if(res.type == 200){
							itemData = res.payload;
							return IndexedDbStorage.put("items", {
								type: "preview",
								course: itemData.course,
								color: itemData.color,
								id: itemData.id,
								prix: itemData.prix,
								titre: itemData.titre
							})
						} else if(getVersionPort) getVersionPort.postMessage({
							type: "Error",
							payload: {
								stage: "SubmitPreview",
								err: "Unknown"
							}
						})

						
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ type: "updPreview", payload: {id: request.reqId, item: itemData} }) });
					break;
				case "article":
					return fetcher({
						url: "./serveur/push.php",
						method: "POST",
						data: { // Send article
							submitArticle: true,
							titre: request.data.titre,
							prix: request.data.prix,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						if(res.type == 200){
							itemData = res.payload;
							return IndexedDbStorage.put("items", {
								type: "article",
								course: itemData.course,
								color: itemData.color,
								id: itemData.id,
								prix: itemData.prix,
								titre: itemData.titre
							})
						} else if(getVersionPort){
							if(res.type == 201 && res.error && res.error == "NegVal"){
								if(res.error == "NegVal") getVersionPort.postMessage({
									type: "Error",
									payload: {
										stage: "SubmitArticle",
										err: "NegVal"
									}
								})
							} else getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "SubmitArticle",
									err: "Unknown"
								}
							})
						}
						
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ type: "updArticle", payload: {id: request.reqId, item: itemData} }) });
					break;
				case "delPreview":
					return fetcher({
						url: "./serveur/push.php",
						method: "POST",
						data: { // Send article
							deletePreview: true,
							id: request.data.id,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						if(res.type == 200) return IndexedDbStorage.delete("items", request.data.id)
						else if(getVersionPort){
							if(res.type == 203){
								getVersionPort.postMessage({
									type: "Error",
									payload: {
										stage: "DeletePreview",
										err: "OldCourse"
									}
								})
							}
							else if (res.type == 204) getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "DeletePreview",
									err: "NotFound"
								}
							})
							else getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "DeletePreview",
									err: "Unknown"
								}
							})
						}
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId));
					break;
				case "delArticle":
					return fetcher({
						url: "./serveur/push.php",
						method: "POST",
						data: { // Send article
							deleteArticle: true,
							id: request.data.id,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						if(res.type == 200){
							itemData = res;
							return IndexedDbStorage.delete("items", request.data.id)
						} else if(getVersionPort){
							if(res.type == 203){
								getVersionPort.postMessage({
									type: "Error",
									payload: {
										stage: "DeleteArticle",
										err: "OldCourse"
									}
								})
							}
							else if (res.type == 204) getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "DeleteArticle",
									err: "NotFound"
								}
							})
							else getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "DeleteArticle",
									err: "Unknown"
								}
							})
						}
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))/* 
					.then(() => { if(getVersionPort) getVersionPort.postMessage({ payload: {
						type: "deleteArticleSetTotal",
						prix: itemData.prix
					} }) }) */;
					break;
				case "buy":
					return fetcher({
						method: "POST",
						url: "./serveur/push.php",
						data: {
							buyPreview: true,
							id: request.data.id,
							prix: request.data.prix,
							groupe: request.data.groupe
						}
					})
					.then(res => {
						if(res.type == 200){
							itemData = res.payload;
							IndexedDbStorage.put("items", {...itemData, type: "article"});
						} else if(getVersionPort){
							if(res.type == 201 && res.error && res.error == "NegVal"){
								if(res.error == "NegVal") getVersionPort.postMessage({
									type: "Error",
									payload: {
										stage: "Buy",
										err: "NegVal"
									}
								})
							}
							else if (res.type == 204) getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "Buy",
									err: "NotFound"
								}
							})
							else getVersionPort.postMessage({
								type: "Error",
								payload: {
									stage: "Buy",
									err: "Unknown"
								}
							})
						}
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => { if(getVersionPort) getVersionPort.postMessage({type: "buy",  payload: {id: request.reqId, item: itemData} }) });
					break;
			}
		}));
	});
};

async function coursesServerResponse(event){
	try {
		const preloadResponse = await event.preloadResponse;
		if (preloadResponse) {
			return preloadResponse;
		}

		const networkResponse = await fetch(event.request);
		return networkResponse;
	} catch (error) {
		/* console.log('Fetch failed; returning offline page instead.', error);

		const cache = await caches.open(staticCacheName); 
		const cachedResponse = await cache.match(offlineServerRes);
		return cachedResponse;*/
		return new Response('{"status":"offline"}', { headers: { 'Content-Type': 'application/json'}});
	}
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