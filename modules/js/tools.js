function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}

function jsonEqual(a,b) {
	return JSON.stringify(a) === JSON.stringify(b);
}


function fetcher(reqData){
	return fetch(reqData.url, {
		method: reqData.method,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: new URLSearchParams(reqData.data),
	})
	.then(res => res.json());
}

class QueueHandler { // https://medium.com/@karenmarkosyan/how-to-manage-promises-into-dynamic-queue-with-vanilla-javascript-9d0d1f8d4df5
	constructor(){
		this.queue = [];
		this.pendingPromise = false;
	}
	enqueue(promise) {
		return new Promise((resolve, reject) => {
			if(this.queue.length) document.querySelector('.loader').classList.add('opened');
			this.queue.push({
				promise,
				resolve,
				reject,
			});
			this.dequeue();
		});
	}
	dequeue() {
		if (this.workingOnPromise) {
			return false;
		}
		const item = this.queue.shift();
		if (!item) {
			return false;
		}
		try {
			this.workingOnPromise = true;
			item.promise()
			.then((value) => {
				this.workingOnPromise = false;
				item.resolve(value);
				this.dequeue();
			})
			.catch(err => {
				this.workingOnPromise = false;
				item.reject(err);
				this.dequeue();
			})
			.then(() => {
				if(!this.queue.length) document.querySelector('.loader').classList.remove('opened');
			});
		} catch (err) {
			this.workingOnPromise = false;
			item.reject(err);
			this.dequeue();
			if(!this.queue.length) document.querySelector('.loader').classList.remove('opened');
		}
		return true;
	}
}

export { $_GET, jsonEqual, fetcher, QueueHandler };