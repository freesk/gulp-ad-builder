window.addEventListener("load", function() {
	'use strict';

	try {
		EB
	} catch (e) {
		console.log(new Error('EB is not available'));
		fakeSizemkEnvironment();
	}

	function fakeSizemkEnvironment() {
		window.EB = {
			isInitialized: function() {
				return true
			},
			clickthrough: function() {
				console.log('click');
			}
		}
	}

	if (EB.isInitialized()) {
		init();
	} else {
		EB.addEventListener(EBG.EventName.EB_INITIALIZED, init);
	}

});
