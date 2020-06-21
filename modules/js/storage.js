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
			if(this.db){
				let request = this.db.transaction([objStore], "readwrite").objectStore(objStore).put(obj);
				request.onsuccess = event => resolve();
				request.onerror = event => reject(event.target.error);
			} else reject("Database not defined yet");
		});
	}
	delete(objStore, key){
		return new Promise((resolve, reject) => {
			if(this.db){
				let request = this.db.transaction([objStore], "readwrite").objectStore(objStore).delete(key);
				request.onsuccess = event => resolve();
				request.onerror = event => reject("Transaction failed");
			} else reject("Database not defined yet");
		});
	}
	get(objStore, key){
		return new Promise((resolve, reject) => {
			if(this.db){
				let request = this.db.transaction(objStore).objectStore(objStore).get(key);
				request.onsuccess = event => resolve(event.target.result);
				request.onerror = event => reject("Transaction failed");
			} else reject("Database not defined yet");
		});
	}
}

let idbStorage = new IndexedDbStorage();

export { LocalStorage, idbStorage };