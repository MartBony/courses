class Storage{
	constructor(dbVer = 1, dbName = "offlineDb"){
		let groupesOStore;
		this.request = indexedDB.open(dbName, dbVer);

		this.request.onerror = function(event) {
			alert("Il y a eu une erreur avec la base de donné locale de votre appareil. Certaines informations ne seront pas disponibles hors ligne.");
		};

		this.request.onsuccess = (event) => {
			this.setgroupe({id: 1, nom: "Marmottes"});
		}

		this.request.onupgradeneeded = function(event) {
			this.db = event.target.result;

			groupesOStore = this.db.createObjectStore("groupes", { keyPath: "id" });
			// groupesOStore.createIndex("id", "id", { unique: true });

		};

	}
	length(){
		return localStorage.length;
	}
	setgroupe(arrayData, callback){

		let transaction = db.transaction(["groupes"], "readwrite");

		transaction.oncomplete = function(event) {
			console.log("All done!");
		};
		
		transaction.onerror = function(event) {
			console.error("IDB transaction uncompleted");
		};
		
		var objectStore = transaction.objectStore("groupes");
		arrayData.forEach(function(obj) {
			var request = objectStore.add(obj);
			request.onsuccess = function(event) {
				callback();
			};
		});
		
	}
	getItem(key){
		return JSON.parse(localStorage.getItem(key));
	}
	removeItem(key){
		localStorage.removeItem(key);
		return this;
	}
	clear(){
		localStorage.clear();
		return this;
	}
}

let offlineStorage = new Storage();


export default offlineStorage;