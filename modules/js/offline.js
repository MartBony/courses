
import idbStorage from './indexedDb.js';

class Offline{
	static async structure(id){
		return new Promise((resolve) => {
			idbStorage.get("structures", id).then(data => resolve(data));
		});
	}
	static async groupe(id){
		return new Promise((resolve, reject) => {
			idbStorage.get("groupes", id).then(data => resolve(data));
		});
	}
	static async course(id){
		return new Promise((resolve, reject) => {
			idbStorage.get("courses", id).then(data => resolve(data));
		});
	}
}

export default Offline;