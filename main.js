import Renderer from './CMapJS/Rendering/Renderer.js';
import * as THREE from './CMapJS/Libs/three.module.js';
import { OrbitControls } from './CMapJS/Libs/OrbitsControls.js';
import {DualQuaternion} from './DualQuaternion.js';

import CMap1 from './CMapJS/CMap/CMap1.js';
import { cutAllEdges } from './CMapJS/Utils/Subdivision.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000.0);
camera.position.set(0, 0.5, 1.5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0xffffff, 1);
pointLight0.position.set(10,8,5);
scene.add(pointLight0);

const orbit_controls = new OrbitControls(camera, renderer.domElement)


window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});



const world0 = new THREE.Vector3(0, 0, 0);
const worldX = new THREE.Vector3(1, 0, 0);
const worldY = new THREE.Vector3(0, 1, 0);
const worldZ = new THREE.Vector3(0, 0, 1);


const translation0 = new THREE.Quaternion(0.25, 0.45, -0.2, 0);
const rotation0 = new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 3);
const dq0 = DualQuaternion.setFromRotationTranslation(rotation0, translation0);

const translation1 = new THREE.Quaternion(0, 0.03, 0, 0);
const rotation1 = new THREE.Quaternion().setFromAxisAngle(worldX, -Math.PI / 2);
const dq1 = DualQuaternion.setFromRotationTranslation(rotation1, translation1);

const translation2 = new THREE.Quaternion(0, 0.3, 0, 0);
const rotation2 = new THREE.Quaternion().setFromAxisAngle(worldZ, -3*Math.PI / 7);
rotation2.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, Math.PI / 6))
const dq2 = DualQuaternion.setFromRotationTranslation(rotation2, translation2);


const translation3 = new THREE.Quaternion(0, 0.03, 0, 0);
const rotation3 = new THREE.Quaternion().setFromAxisAngle(worldY, -2*Math.PI / 7);
rotation3.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, 2*Math.PI / 3))
const dq3 = DualQuaternion.setFromRotationTranslation(rotation3, translation3);


const geometryCone = new THREE.ConeGeometry(0.02, 0.1, 16, 1);
geometryCone.translate(0, 0.05, 0)
const red = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true});
const green = new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: true});
const blue = new THREE.MeshLambertMaterial({color: 0x0000ff, wireframe: true});
const yellow = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true});
const cyan = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true});
const magenta = new THREE.MeshLambertMaterial({color: 0x00ffff, wireframe: true});
const white = new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: true});
const black = new THREE.MeshLambertMaterial({color: 0x000000, wireframe: true});

const geometryOrigin = new THREE.SphereGeometry(0.0125, 32, 32);
const origin = new THREE.Mesh(geometryOrigin, white)

scene.add(origin)

const coneDQ0 = new THREE.Mesh(geometryCone, red);
scene.add(coneDQ0)

const coneDQ1 = new THREE.Mesh(geometryCone, green);
scene.add(coneDQ1)

const coneDQ2 = new THREE.Mesh(geometryCone, blue);
scene.add(coneDQ2)

const coneDQ3 = new THREE.Mesh(geometryCone, yellow);
scene.add(coneDQ3)


coneDQ0.position.copy(dq0.transform(world0.clone()))
coneDQ0.quaternion.copy(dq0.real)

coneDQ1.position.copy(dq1.transform(world0.clone()))
coneDQ1.quaternion.copy(dq1.real)

coneDQ2.position.copy(dq2.transform(world0.clone()))
coneDQ2.quaternion.copy(dq2.real)

coneDQ3.position.copy(dq3.transform(world0.clone()))
coneDQ3.quaternion.copy(dq3.real)



const geometrySampleCone = new THREE.ConeGeometry(0.005, 0.025, 16, 1);
geometrySampleCone.translate(0, 0.0125, 0);

const nbSamples = 120;

const conesLinearBlend = new THREE.InstancedMesh(geometrySampleCone, black, nbSamples);
scene.add(conesLinearBlend)

const conesBezier = new THREE.InstancedMesh(geometrySampleCone, black, nbSamples);
scene.add(conesBezier)

const gridDivs = 50;
const conesGrid = new THREE.InstancedMesh(geometrySampleCone, black, (gridDivs+1)*(gridDivs+1));
scene.add(conesGrid);

function createGrid() {
	let step = 1 / gridDivs;
	const scale = new THREE.Vector3(0.125, 0.125, 0.125);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i <= gridDivs; ++i) {
		for(let j = 0; j <= gridDivs; ++j) {
			let r = i * step;
			let t = j * step;
			
			// const r0 = dq0.clone().multiplyScalar(1-r);
			// r0.add(dq1.clone().multiplyScalar(r));
			const r0 = dq0.clone().lerpShortest(dq1, r)
			const r1 = dq3.clone().lerpShortest(dq2, r)
			r0.lerpShortest(r1, t)
			// const r1 = dq3.clone().multiplyScalar(1-r);
			// r1.add(dq2.clone().multiplyScalar(r));
			// r0.multiplyScalar(1-t);
			// r0.add(r1.multiplyScalar(t)).normalize()

			matrix.compose(r0.getTranslation(), r0.getRotation(), scale);
			conesGrid.setMatrixAt(j + gridDivs * i, matrix)
		}
	}
	conesGrid.instanceMatrix.needsUpdate = true;
}
createGrid();

function linearBlendSamples() {
	const scale = new THREE.Vector3(0.5, 0.5, 0.5);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < nbSamples / 4; ++i) {
		let t = i / (nbSamples / 4);
		// const sampleDq0 = dq0.clone().multiplyScalar(1-t)
		// sampleDq0.add(dq1.clone().multiplyScalar(t))

		// const sampleDq1 = dq1.clone().multiplyScalar(1-t)
		// sampleDq1.add(dq2.clone().multiplyScalar(t))

		// const sampleDq2 = dq2.clone().multiplyScalar(1-t)
		// sampleDq2.add(dq3.clone().multiplyScalar(t))

		// const sampleDq3 = dq3.clone().multiplyScalar(1-t)
		// sampleDq3.add(dq0.clone().multiplyScalar(t))

		const sampleDq0 = dq0.clone().lerpShortest(dq1, t);
		const sampleDq1 = dq1.clone().lerpShortest(dq2, t);
		const sampleDq2 = dq2.clone().lerpShortest(dq3, t);
		const sampleDq3 = dq3.clone().lerpShortest(dq0, t);

		matrix.compose(sampleDq0.getTranslation(), sampleDq0.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i, matrix);
		matrix.compose(sampleDq1.getTranslation(), sampleDq1.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + (nbSamples / 4), matrix);
		matrix.compose(sampleDq2.getTranslation(), sampleDq2.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + 2 * (nbSamples / 4), matrix);
		matrix.compose(sampleDq3.getTranslation(), sampleDq3.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + 3 * (nbSamples / 4), matrix);
	}

	conesLinearBlend.instanceMatrix.needsUpdate = true;
}
linearBlendSamples();

function deCasteljauDQ(samples) {
	const step = 1 / (samples - 1);
	const dqSamples = [];

	for(let t = 0; t < samples; ++t) {
		const dqsClone = [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()];
		for(let i = 1; i < dqsClone.length; ++i) {
			for(let j = 0; j < dqsClone.length - i; ++j) {
				dqsClone[j].lerp(dqsClone[j+1], t*step);
			}
		} 
		dqSamples.push(dqsClone[0].clone());
	}

	return dqSamples;
}

function bezierSamples() {
	const dqSamples = deCasteljauDQ(nbSamples);

	const scale = new THREE.Vector3(0.5, 0.5, 0.5);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < dqSamples.length; ++i) {
		matrix.compose(dqSamples[i].getTranslation(), dqSamples[i].getRotation(), scale);
		conesBezier.setMatrixAt(i, matrix);
	}
	conesBezier.instanceMatrix.needsUpdate = true;
}

bezierSamples()



const conesFourPoints = new THREE.InstancedMesh(geometrySampleCone, black, 1024);
scene.add(conesFourPoints);
const cmap1 = new CMap1;
cmap1.createEmbedding(cmap1.vertex);

const cmapDQ = cmap1.addAttribute(cmap1.vertex, "dq");
const cmapPos = cmap1.addAttribute(cmap1.vertex, "position");

function fourPoints() {
	let vertex = cmap1.vertex;
	let fd = cmap1.addFace(4);
	// cmapPos[cmap1.cell(vertex, fd)] = dq0.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq0.clone();
	fd = cmap1.phi1[fd]
	// cmapPos[cmap1.cell(vertex, fd)] = dq1.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq1.clone();
	fd = cmap1.phi1[fd]
	// cmapPos[cmap1.cell(vertex, fd)] = dq2.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq2.clone();
	fd = cmap1.phi1[fd]
	// cmapPos[cmap1.cell(vertex, fd)] = dq3.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq3.clone();

	for(let i = 0; i < 7; ++i) {
		const vertexCache = [];
		cutAllEdges(cmap1, vd => {
			vertexCache.push(vd);
			cmapPos[cmap1.cell(vertex, vd)] = new THREE.Vector3
			cmapDQ[cmap1.cell(vertex, vd)] = new DualQuaternion
		})

		cmap1.foreach(vertex, vd => {
			let vid = cmap1.cell(vertex, vd);
			// cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi_1[vd])], 9/16)
			// cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi1[vd])], 9/16)
			// cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi([1, 1, 1], vd))], -1/16)
			// cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi([-1, -1,-1], vd))], -1/16)

			cmapDQ[vid].copy(cmapDQ[cmap1.cell(vertex, cmap1.phi_1[vd])]).multiplyScalar(9/16);
			cmapDQ[vid].addScaledDualQuaternion(cmapDQ[cmap1.cell(vertex, cmap1.phi1[vd])], 9/16);
			cmapDQ[vid].addScaledDualQuaternion(cmapDQ[cmap1.cell(vertex, cmap1.phi([1, 1, 1], vd))], -1/16)
			cmapDQ[vid].addScaledDualQuaternion(cmapDQ[cmap1.cell(vertex, cmap1.phi([-1, -1, -1], vd))], -1/16)
			cmapDQ[vid].normalize();

		}, {cache: vertexCache})
	}

	const scale = new THREE.Vector3(0.125, 1, 0.125);
	const matrix = new THREE.Matrix4();
	const nbVertex = cmap1.nbCells(cmap1.vertex);
	for(let i = 0; i < nbVertex; ++i) {
		matrix.compose(cmapDQ[i].getTranslation(), cmapDQ[i].getRotation(), scale);
		conesFourPoints.setMatrixAt(i, matrix);

	}
	conesFourPoints.instanceMatrix.needsUpdate = true;
}

fourPoints()

const grid = new THREE.GridHelper(1, 10)
scene.add(grid)

let frameCount = 0;
function update (t)
{
}

function render()
{
	renderer.render(scene, camera);
}

function mainloop(t)
{
    update(t);
    render();
	requestAnimationFrame(mainloop);
}

mainloop(0);