const syncCourses = () => {
	return IndexedDbStorage.getAll("requests").then(requests => {
		return Promise.all(requests.map(request => {
			let itemData;
			switch(request.type){ // Add catch statements
				case "activate":
					return fetcher({
						url: "serveur/push.php",
						method: "POST",
						data: { activate: true, groupe: request.data.groupe }
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
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
								prix: 0,
								titre: itemData.titre
							})
						} else postMessageToCLients("Error", { stage: "SubmitPreview", err: "Unknown" })
						
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => {
						postMessageToCLients("updPreview", {id: request.reqId, item: itemData});
					});
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
						} else if(res.type == 201 && res.error && res.error == "NegVal") postMessageToCLients("Error", { stage: "SubmitArticle", err: "NegVal" })
						else postMessageToCLients("Error", { stage: "SubmitArticle", err: "Unknown" })
						
					})// Delete Request; // Update course
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => {
						postMessageToCLients("updArticle", {id: request.reqId, item: itemData});
					});
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
						else if(res.type == 203) postMessageToCLients("Error", { stage: "DeletePreview", err: "OldCourse" })
						else if (res.type == 204) postMessageToCLients("Error", { stage: "DeletePreview", err: "NotFound" })
						else postMessageToCLients("Error", { stage: "DeletePreview", err: "Unknown" })
						
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
						} else if(res.type == 203) postMessageToCLients("Error", { stage: "DeleteArticle", err: "OldCourse" })
						else if (res.type == 204) postMessageToCLients("Error", { stage: "DeleteArticle", err: "NotFound" })
						else postMessageToCLients("Error", { stage: "DeleteArticle", err: "Unknown" })
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId));
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
						} else if(res.type == 201 && res.error && res.error == "NegVal") postMessageToCLients("Error", { stage: "Buy", err: "NegVal" })
						else if (res.type == 204) postMessageToCLients("Error", { stage: "Buy", err: "NotFound" })
						else postMessageToCLients("Error", { stage: "Buy", err: "Unknown" })
					
					})
					.then(() => IndexedDbStorage.delete("requests", request.reqId))
					.then(() => {
						postMessageToCLients("buy", {id: request.reqId, item: itemData});
					});
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