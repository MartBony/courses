class IndexedDbStorage{
	static openDB(dbVer = 2, dbName = "offlineDb"){
		return new Promise((resolve, reject) => {
			
			const request = indexedDB.open(dbName, dbVer);

			request.onerror = function(event) {
				console.error("Error in openning the local database");
				reject(event);
			};

			request.onsuccess = (event) => resolve(event.target.result)

			request.onupgradeneeded = function(event) {
				const db = event.target.result;
				let completeEvents = [],
				requestsStore, coursesStore, structuresStore, groupesStore, itemsStore;

				switch(event.oldVersion){
					case 0:
						requestsStore = db.createObjectStore("requests", { keyPath: "reqId" , autoIncrement : true});
						coursesStore = db.createObjectStore("courses", { keyPath: "id" });
						structuresStore = db.createObjectStore("structures", { keyPath: "id" });
						groupesStore = db.createObjectStore("groupes", { keyPath: "id" });

						requestsStore.createIndex("type", "type", {unique: false});
						coursesStore.createIndex("id", "id", {unique: true});
						itemsStore = db.createObjectStore("items", { keyPath: "id" });
						
						[requestsStore, coursesStore, structuresStore, groupesStore, itemsStore].map(objStore => completeEvents.push(objStore));
						
					case 1:
						if (!itemsStore) itemsStore = event.target.transaction.objectStore("items", { keyPath: "id" });
						itemsStore.createIndex("course", "course", {unique: false});
						completeEvents.push(itemsStore);
					/* case 1: DO NOT DELETE, expamles of db update processes
						itemsStore = db.createObjectStore("items", { keyPath: "id" });
						completeEvents.push(itemsStore);
						break; remove the break
					case 2:
						itemsStore = event.target.transaction.objectStore("items", { keyPath: "id" });
						itemsStore.createIndex("randind", "randind", {unique: true});
						completeEvents.push(itemsStore);
						break; remove the break */
				}

				Promise.all(completeEvents.map(objStore => new Promise((resolve, reject) => {
					objStore.oncomplete = event => resolve();
				})))
				.then(() => resolve(db));

			};

		})

	}
	static put(objStore, obj){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			let request = db.transaction([objStore], "readwrite").objectStore(objStore).put(obj);
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject(new Error('fail')) (event.target.error);
		}));
	}
	static delete(objStore, key){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			let request = db.transaction([objStore], "readwrite").objectStore(objStore).delete(key);
			request.onsuccess = event => resolve();
			request.onerror = event => reject("Transaction failed");
		}));
	}
	static get(objStore, key){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			let request = db.transaction(objStore).objectStore(objStore).get(key);
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject("Transaction failed");
		}));
	}
	static getAll(objStore){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			let request = db.transaction(objStore).objectStore(objStore).getAll();
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject("Transaction failed for getAll");
		}));
	}
	static getCursorwise(objStore, indexName = null, indexValue = null, constants = "next", keyRange = null, limit = null){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
				
			let results = [],
			store = db.transaction(objStore).objectStore(objStore);
			const openCursor = indexName && indexValue ?
				store.index(indexName).openCursor(indexValue) :
				store.openCursor(keyRange, constants);

			openCursor.onsuccess = event => {
				const cursor = event.target.result;
				let i = limit ? limit[0] : 0; 
				if (cursor) {
					results.push(cursor.value);
					i++;
					if(!limit || i < limit[1]) cursor.continue();
				} else {
					console.log("End of cursor")
				}
				resolve(results);
				
			}
		}));

	}
	static deleteDb(){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			let request = indexedDB.deleteDatabase("offlineDb");
			request.onblocked = function(event) {
				reject("Error message: Database in blocked state. ");
			};
			request.onerror = function(event) {
				reject("Error deleting database.");
			};

			request.onsuccess = function(event) {
				resolve(request.result)
			};
		}));
	}
}