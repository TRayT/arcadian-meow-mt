function toggle_fullscreen() {
		if (!document.fullscreenElement && !document.mozFullScreenElement &&
				!document.webkitFullscreenElement && !document.msFullscreenElement ) {
				if (document.documentElement.requestFullscreen) {
						document.documentElement.requestFullscreen();
				} else if (document.documentElement.msRequestFullscreen) {
						document.documentElement.msRequestFullscreen();
				} else if (document.documentElement.mozRequestFullScreen) {
						document.documentElement.mozRequestFullScreen();
				} else if (document.documentElement.webkitRequestFullscreen) {
						document.documentElement.webkitRequestFullscreen();
				}
		} else {
				if (document.exitFullscreen) {
						document.exitFullscreen();
				} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
				}
		}
}

function resize(camera, renderer){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
}
