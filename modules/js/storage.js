class LocalStorage{
	static length(){
		return localStorage.length;
	}
	static setItem(key, value){
		localStorage.setItem(key, JSON.stringify(value));
		return this;
	}
	static getItem(key){
		return JSON.parse(localStorage.getItem(key));
	}
	static removeItem(key){
		localStorage.removeItem(key);
		return this;
	}
	static clear(){
		localStorage.clear();
		return this;
	}
}

class IndexedDbStorage{
	static openDB(dbVer = 2, dbName = "offlineDb"){
		return new Promise((resolve, reject) => {
			
			const request = indexedDB.open(dbName, dbVer);

			request.onerror = function(event) {
				console.error("Error in openning the local database");
				console.error(event);
				reject(event);
			};

			request.onsuccess = (event) => resolve(event.target.result)

			request.onupgradeneeded = function(event) {
				const db = event.target.result;
				let completeEvents = [],
				requestsStore, coursesStore, structuresStore, groupesStore, itemsStore;

				switch(event.oldVersion){
					case 0:
						
						coursesStore = db.createObjectStore("courses", { keyPath: "id" });
						structuresStore = db.createObjectStore("structures", { keyPath: "id" });
						groupesStore = db.createObjectStore("groupes", { keyPath: "id" });

						
						[structuresStore, groupesStore].map(objStore => completeEvents.push(objStore));
						
					case 1:
						requestsStore = db.createObjectStore("requests", { keyPath: "reqId" , autoIncrement : true});
						requestsStore.createIndex("type", "type", {unique: false});
						
						if (!coursesStore) coursesStore = event.target.transaction.objectStore("courses");
						coursesStore.createIndex("id", "id", {unique: true});

						itemsStore = db.createObjectStore("items", { keyPath: "id" });
						itemsStore.createIndex("course", "course", {unique: false});
						
						[requestsStore, coursesStore, itemsStore].map(objStore => completeEvents.push(objStore));
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

				// Wait for all objecstores to update
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
			const request = db.transaction([objStore], "readwrite").objectStore(objStore).put(obj);
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject(new Error('fail')) (event.target.error);
		}));
	}
	static delete(objStore, key){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			const request = db.transaction([objStore], "readwrite").objectStore(objStore).delete(key);
			request.onsuccess = event => resolve();
			request.onerror = event => reject("Transaction failed");
		}));
	}
	static get(objStore, key){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			const request = db.transaction(objStore).objectStore(objStore).get(key);
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject("Transaction failed");
		}));
	}
	static getAll(objStore){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
			const request = db.transaction(objStore).objectStore(objStore).getAll();
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject("Transaction failed for getAll");
		}));
	}
	static getCursorwise(objStore, indexName = null, indexValue = null, constants = "next", keyRange = null, limit = null){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
				
			let results = [],
			store = db.transaction(objStore).objectStore(objStore),
			i = limit ? limit[0] : 0;

			const openCursor = indexName && indexValue ?
				store.index(indexName).openCursor(indexValue) :
				store.openCursor(keyRange, constants);

			openCursor.onsuccess = event => {
				const cursor = event.target.result;
				if (cursor && (!limit || i < limit[1])) {
					results.push(cursor.value);
					i++;
					
					cursor.continue();
				} else resolve(results);

			}
		}));

	}
	static filterCursorwise(objStore, indexName = null, indexValue = null, filterFunction = () => true){
		return IndexedDbStorage.openDB()
		.then(db => new Promise((resolve, reject) => {
				
			let results = [],
			store = db.transaction([objStore], "readwrite").objectStore(objStore);
			const openCursor = indexName && indexValue ?
				store.index(indexName).openCursor(indexValue) :
				store.openCursor();

			openCursor.onsuccess = event => {
				const cursor = event.target.result;
				if (cursor) {
					if(!filterFunction(cursor.value)) cursor.delete();
					cursor.continue();
				} else resolve(results);
				
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


export { LocalStorage, IndexedDbStorage };