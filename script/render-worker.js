import * as THREE from 'three';

let dynamics, agency, scene, renderer, last, camera, camera_offset, callback, mesh = [];
let k, lastK;
const phy_dt = 1/30;

const kFrame = (time, pos, rot) => {
	let positions = [], rotations = [];

	mesh.forEach((n, i) => {
		positions.push(new THREE.Vector3(pos[3*i],pos[3*i+1],pos[3*i+2]));
		rotations.push(
			new THREE.Quaternion(rot[4*i],rot[4*i+1],rot[4*i+2],rot[4*i+3])
		);
	})

	return {
		time: time + phy_dt,
		positions: positions,
		rotations: rotations
	}
}

const agencyResponse = message => {
	const handlers = {
		camera: data => {
			camera_offset.set(data.x, data.y, data.z);
		}
	}
	handlers[message.data.type](message.data);
}

const dynamicsResponse = message => {
	const data = message.data;
	if(k) lastK = k;

	k = kFrame(data.time, data.positions, data.quaternions);
}

const updateView = (width, height) => {
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height, false);
}

const mainResponse = message => {
	const handlers = {
		resize: data => updateView(data.width, data.height),
		blur: data => {

		},
		focus: data => {

		},
		start: data => {
			render();
		},
		stop: data => {
			cancelAnimationFrame(callback);
		}
	}

	handlers[message.data.type](message.data);
}

const init = e => {
	self.onmessage = mainResponse;
	dynamics = e.data.dynamics;
	dynamics.onmessage = dynamicsResponse;
	agency = e.data.agency;
	agency.onmessage = agencyResponse;

	let aspect = e.data.width / e.data.height;
	renderer = new THREE.WebGLRenderer({canvas: e.data.canvas});
	renderer.setSize(e.data.width, e.data.height, false);
	camera = new THREE.PerspectiveCamera(90, aspect, 0.1, 1000);
	camera.up.set(0,0,1);
	camera_offset = new THREE.Vector3(0,5,3);
	scene = new THREE.Scene();

	//Player geometry
	const player = new THREE.Mesh(
		new THREE.IcosahedronGeometry(1/2, 1),
		new THREE.MeshBasicMaterial({color:0x009900})
	);
	//Adding the player to the scene and the list of tracked meshes
	scene.add(player); 
	mesh.push(player);
	//Ground geometry
	const material = new THREE.MeshBasicMaterial({color: 0x222222});
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material);

	const reportPlayerPosition = () => {
		console.log(player.position);
	}

	setInterval(reportPlayerPosition, 1000);

	scene.add(ground);
	mesh.push(ground);

	for(let i = 0; i != 80; i++){
		const cube = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshBasicMaterial({color:0x990000})
		);
		
		scene.add(cube); 
		mesh.push(cube);
	}
	
	console.log("Meshes", mesh.map(m => m.position));
}

const render = () => {
	callback = requestAnimationFrame(render);
	const now = performance.now();
	const dt = now - last;

	if(lastK) {
		const lerp = (now - lastK.time)/(k.time - lastK.time);
		mesh.forEach((n,i) => {
			n.position.lerpVectors(lastK.positions[i], k.positions[i], lerp);
			n.quaternion.slerpQuaternions(lastK.rotations[i], k.rotations[i], lerp);
		});
	}
	//update_camera
	//camera.position.addVectors(mesh[0].position, camera_offset);
	camera.lookAt(mesh[0].position);
	//end update_camera
	renderer.render(scene, camera);
	last = now;
}

self.onmessage = init;
