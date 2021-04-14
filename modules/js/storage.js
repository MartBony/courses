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

let db;

class IndexedDbStorage{
	static openDB(dbVer = 4, dbName = "offlineDb"){
		return new Promise((resolve, reject) => {
			
			if(!db){
				const request = indexedDB.open(dbName, dbVer);

				request.onerror = function(event) {
					console.error("Error in openning the local database");
					console.error(event);
					reject(event);
				};

				request.onsuccess = (event) => {
					db = event.target.result;
					resolve(event.target.result)
				}

				request.onupgradeneeded = function(event) {
					db = event.target.result;
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
					
						case 2:
							if (!coursesStore) coursesStore = event.target.transaction.objectStore("courses");
							coursesStore.createIndex("groupe", "groupe", {unique: false});
						case 3:
							if (!groupesStore) groupesStore = event.target.transaction.objectStore("groupes");
							groupesStore.createIndex("user", "user", {unique: false});

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
					if(completeEvents.length){
						Promise.all(completeEvents.map(objStore => new Promise((res, rej) => {
							objStore.oncomplete = event => res();
						})))
						.then(() => resolve(db));
					} else resolve(db);
					

				};
			} else resolve(db);

		})

	}
	static put(objStore, obj){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
				const request = db.transaction([objStore], "readwrite").objectStore(objStore).put(obj);
				request.onsuccess = event => {
					resolve(event.target.result);
				};
				request.onerror = event => reject(new Error('fail')) (event.target.error);
			})
		});
	}
	static delete(objStore, key){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
				const request = db.transaction([objStore], "readwrite").objectStore(objStore).delete(key);
				request.onsuccess = event => {
					resolve();
				};
				request.onerror = event => reject("Transaction failed");
			})
		});
	}
	static get(objStore, key){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
				const request = db.transaction(objStore).objectStore(objStore).get(key);
				request.onsuccess = event => {
					resolve(event.target.result);
				};
				request.onerror = event => reject("Transaction failed");
			});
		});
	}
	static getAll(objStore){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
				const request = db.transaction(objStore).objectStore(objStore).getAll();
				request.onsuccess = event => {
					resolve(event.target.result)
				};
				request.onerror = event => reject("Transaction failed for getAll");
			})
		});
	}
	static getCursorwise(objStore, indexName = null, indexValue = null, constants = "next", keyRange = null, limit = null){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
					
				let results = [],
				store = db.transaction(objStore).objectStore(objStore),
				i = limit ? limit[0] : 0;

				const openCursor = indexName && indexValue ?
					store.index(indexName).openCursor(indexValue, constants) :
					store.openCursor(keyRange, constants);

				openCursor.onsuccess = event => {
					const cursor = event.target.result;
					if (cursor && (!limit || i < limit[1])) {
						results.push(cursor.value);
						i++;
						
						cursor.continue();
					} else {
						resolve(results);
					}

				}
			})
		});

	}
	static filterCursorwise(objStore, indexName = null, indexValue = null, filterFunction = () => true){
		return new Promise((resolve, reject) => {
			IndexedDbStorage.openDB()
			.then(db => {
					
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
					} else {
						resolve(results);
					}
					
				}
			})
		});
	}
	static async closeIDB(){
		if(db){
			await db.close();
			db = null;
		}
	}
	static deleteDb(){ // Requires shutting-down Service-Worker
		return new Promise((resolve, reject) => {
			let request = indexedDB.deleteDatabase("offlineDb");
			request.onblocked = () => {
				reject("Error message: Database in blocked state. ");
			};
			request.onerror = function(event) {
				reject("Error deleting database.");
			};

			request.onsuccess = function(event) {
				resolve(request.result);
			}
		});
	}
}

IndexedDbStorage.openDB();

export { LocalStorage, IndexedDbStorage };