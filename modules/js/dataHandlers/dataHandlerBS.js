import Pull from '../requests.js';
import { LocalStorage, idbStorage } from '../storage.js';

const DataHandlerFunctions = {
	pull: async (action, idGroupe, idCourse) => {// Rank as index of array
		console.log("-- PULLING --");
		let update,
			anim = () => {
				$('#refresh i, #headRefresh').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('#refresh i, #headRefresh').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
				},2000);
			};
		this.pending = true;
		this.pullState = { // Network state in pulling
			structure: action != "open",
			groupe: action != "open",
			course: action != "open"
		};

		// Load from network
		Pull.invitations(this);
		let pull = Pull.structure(this)
			.then(data => {
				if(data){
					// Update app
					this.pullState.structure = true;
					console.log('Network structure fetched:', data);
					update = this.updateApp(data, true);
					if(update){
						idGroupe = idGroupe || LocalStorage.getItem('usedGroupe') || data.groupes[0].id;
						// Pull further
						return Pull.groupe(this, idGroupe);
					}
					$('.loader').removeClass('opened');
					this.pending = false;
					anim();
				}
			})
			.then(data => {
				if(data){
					// Update Group
					this.pullState.groupe = true;
					console.log('Network groupe fetched:', data);
					update = this.updateGroupe(data, true);
					if(update){
						idCourse = idCourse || LocalStorage.getItem('usedCourse') || data.coursesList[0].id;
						// if(!idCourse) idCourse = this.usedGroupe.coursesList.length != 0 ? this.usedGroupe.coursesList[0].id : null;
						return Pull.course(this, idCourse);
					}
					$('.loader').removeClass('opened');
					this.pending = false;
					anim();
				}
			})
			.then(data => {
				if(data){
					this.pullState.course = true;
					console.log('Network course fetched:', data);
					update = this.updateCourse(data, true);
				}
				$('.loader').removeClass('opened');
				this.pending = false;
				anim();
				return;
			});

		// Load from indexedDB
		if(action == "open") Offline.pull(this, idGroupe, idCourse)

		return pull;

	}
}

export default DataHandlerFunctions;