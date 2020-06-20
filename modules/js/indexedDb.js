class Storage{
	constructor(dbVer = 1, dbName = "offlineDb"){
		let objectStoreGroupes;
		this.request = indexedDB.open(dbName, dbVer);

		this.request.onerror = function(event) {
			alert("Il y a eu une erreur avec la base de donné locale de votre appareil. Certaines informations ne seront pas disponibles hors ligne.");
		};

		this.request.onsuccess = (event) => this.db = event.target.result;

		this.request.onupgradeneeded = function(event) {
			this.db = event.target.result;

			objectStoreGroupes = this.db.createObjectStore("structures", { keyPath: "id" });
			objectStoreGroupes = this.db.createObjectStore("groupes", { keyPath: "id" });
			objectStoreGroupes = this.db.createObjectStore("courses", { keyPath: "id" });

		};

	}
	put(objStore, obj){
		return new Promise((resolve, reject) => {
			let request = this.db.transaction([objStore], "readwrite").objectStore(objStore).put(obj);
			request.onsuccess = event => resolve();
			request.onerror = event => reject(event.target.error);
		});
	}
	delete(objStore, key){
		return new Promise((resolve, reject) => {
			let request = this.db.transaction([objStore], "readwrite").objectStore(objStore).delete(key);
			request.onsuccess = event => resolve();
			request.onerror = event => reject("Transaction failed");
		});
	}
	get(objStore, key){
		return new Promise((resolve, reject) => {
			let request = this.db.transaction(objStore).objectStore(objStore).get(key);
			request.onsuccess = event => resolve(event.target.result);
			request.onerror = event => reject("Transaction failed");
		});
	}
}

let idbStorage = new Storage();


export default idbStorage;