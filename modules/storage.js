class Storage{
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

export default Storage;