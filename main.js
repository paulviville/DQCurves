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
const renderer = new THREE.WebGLRenderer({antialias: true});
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


const translation0 = new THREE.Quaternion(0., 0.3, -0., 0);
const rotation0 = new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 3);
const dq0 = DualQuaternion.setFromRotationTranslation(rotation0, translation0);

const translation1 = new THREE.Quaternion(0., 0.3, 0., 0);
const rotation1 = new THREE.Quaternion().setFromAxisAngle(worldX, -Math.PI / 2);
const dq1 = DualQuaternion.setFromRotationTranslation(rotation1, translation1);

const translation2 = new THREE.Quaternion(0, 0.3, 0, 0);
const rotation2 = new THREE.Quaternion().setFromAxisAngle(worldZ, -3*Math.PI / 7);
rotation2.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, Math.PI / 6))
const dq2 = DualQuaternion.setFromRotationTranslation(rotation2, translation2);


const translation3 = new THREE.Quaternion(0, 0.3, 0, 0);
const rotation3 = new THREE.Quaternion().setFromAxisAngle(worldY, -2*Math.PI / 7);
rotation3.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, 2*Math.PI / 3))
const dq3 = DualQuaternion.setFromRotationTranslation(rotation3, translation3);
// dq3.multiply(dq2)


const geometryCone = new THREE.ConeGeometry(0.02, 0.1, 3, 1);
geometryCone.translate(0, 0.05, 0)
const red = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true});
const green = new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: true});
const blue = new THREE.MeshLambertMaterial({color: 0x0000ff, wireframe: true});
const yellow = new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true});
const cyan = new THREE.MeshLambertMaterial({color: 0x00FFFF, wireframe: true});
const magenta = new THREE.MeshLambertMaterial({color: 0xFF00FF, wireframe: true});
const white = new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false, transparent: true, opacity: 0.8});
const black = new THREE.MeshLambertMaterial({color: 0x000000, wireframe: false});

const geometryOrigin = new THREE.SphereGeometry(0.3, 32, 32);
const origin = new THREE.Mesh(geometryOrigin, white)

scene.add(origin)

const coneDQ0 = new THREE.Mesh(geometryCone, red);
const coneDQ1 = new THREE.Mesh(geometryCone, green);
const coneDQ2 = new THREE.Mesh(geometryCone, blue);
const coneDQ3 = new THREE.Mesh(geometryCone, yellow);

scene.add(coneDQ0)
scene.add(coneDQ1)
scene.add(coneDQ2)
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
const geometrySampleSphere = new THREE.SphereGeometry(0.0025, 32, 32);
geometrySampleCone.translate(0, 0.0125, 0);

const nbSamples = 240;

const conesLinearBlend = new THREE.InstancedMesh(geometrySampleCone, black, nbSamples);
scene.add(conesLinearBlend)



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
			const r0 = dq0.clone().lerpShortest(dq1, r).normalize()
			const r1 = dq3.clone().lerpShortest(dq2, r).normalize()
			r0.lerpShortest(r1, t).normalize()
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
	for(let i = 0; i < nbSamples / 6; ++i) {
		let t = i / (nbSamples / 6);
		// const sampleDq0 = dq0.clone().multiplyScalar(1-t)
		// sampleDq0.add(dq1.clone().multiplyScalar(t))

		// const sampleDq1 = dq1.clone().multiplyScalar(1-t)
		// sampleDq1.add(dq2.clone().multiplyScalar(t))

		// const sampleDq2 = dq2.clone().multiplyScalar(1-t)
		// sampleDq2.add(dq3.clone().multiplyScalar(t))

		// const sampleDq3 = dq3.clone().multiplyScalar(1-t)
		// sampleDq3.add(dq0.clone().multiplyScalar(t))

		const sampleDq0 = dq0.clone().lerpShortest(dq1, t).normalize();
		const sampleDq1 = dq1.clone().lerpShortest(dq2, t).normalize();
		const sampleDq2 = dq2.clone().lerpShortest(dq3, t).normalize();
		const sampleDq3 = dq3.clone().lerpShortest(dq0, t).normalize();
		// const sampleDq4 = dq0.clone().lerpShortest(dq2, t).normalize();
		// const sampleDq5 = dq1.clone().lerpShortest(dq3, t).normalize();

		matrix.compose(sampleDq0.getTranslation(), sampleDq0.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i, matrix);
		matrix.compose(sampleDq1.getTranslation(), sampleDq1.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + (nbSamples / 6), matrix);
		matrix.compose(sampleDq2.getTranslation(), sampleDq2.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + 2 * (nbSamples / 6), matrix);
		matrix.compose(sampleDq3.getTranslation(), sampleDq3.getRotation(), scale);
		conesLinearBlend.setMatrixAt(i + 3 * (nbSamples / 6), matrix);
		// matrix.compose(sampleDq4.getTranslation(), sampleDq4.getRotation(), scale);
		// conesLinearBlend.setMatrixAt(i + 4 * (nbSamples / 6), matrix);
		// matrix.compose(sampleDq5.getTranslation(), sampleDq5.getRotation(), scale);
		// conesLinearBlend.setMatrixAt(i + 5 * (nbSamples / 6), matrix);
	}

	conesLinearBlend.instanceMatrix.needsUpdate = true;
}
linearBlendSamples();


function deCasteljau(samples, pts, n = 0) {
	const step = 1 / (samples - 1);
	const ptsSamples = [];

	for(let t = 0; t < samples; ++t) {
		const ptsClone = pts.map(dq => dq.clone());
		for(let i = 1; i < ptsClone.length; ++i) {
			for(let j = 0; j < ptsClone.length - i; ++j) {
				ptsClone[j].lerp(ptsClone[j+1], t*step);
			}
		}
		ptsSamples.push(ptsClone[0].clone());
	}

	return ptsSamples;
}

function deCasteljauDQ(samples, dqs, n = 0) {
	const step = 1 / (samples - 1);
	const dqSamples = [];

	for(let t = 0; t < samples; ++t) {
		const dqsClone = dqs.map(dq => dq.clone());
		for(let i = 1; i < dqsClone.length; ++i) {
			for(let j = 0; j < dqsClone.length - i; ++j) {
				dqsClone[j].lerpShortest(dqsClone[j+1], t*step);
				if(n == 1) dqsClone[j].normalize()
				if(n == 2) dqsClone[j].normalize2()
				if(n == 3) dqsClone[j].normalize3()
			}
		}
		dqSamples.push(dqsClone[0].clone());
	}

	return dqSamples;
}

const conesBezier = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
const sphereBezier = new THREE.InstancedMesh(geometrySampleSphere, magenta, nbSamples);
const conesBezier1 = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
const conesBezier2 = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
const conesBezier3 = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
// scene.add(conesBezier)
// scene.add(conesBezier1)
// scene.add(sphereBezier)
// scene.add(conesBezier2)
// scene.add(conesBezier3)

function bezierSamples() {
	const dqSamples = deCasteljauDQ(nbSamples, [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()]);
	const samples = deCasteljau(nbSamples, [dq0.transform(world0), dq1.transform(world0), dq2.transform(world0), dq3.transform(world0)]);
	const dqSamples1 = deCasteljauDQ(nbSamples, [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()],1 );
	const dqSamples2 = deCasteljauDQ(nbSamples, [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()],2);
	const dqSamples3 = deCasteljauDQ(nbSamples, [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()],3);

	const scale = new THREE.Vector3(0.5, 0.5, 0.5);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < dqSamples.length; ++i) {
		matrix.makeTranslation(samples[i].x, samples[i].y, samples[i].z)
		sphereBezier.setMatrixAt(i, matrix)

		matrix.compose(dqSamples[i].getTranslation(), dqSamples[i].getRotation(), scale);
		conesBezier.setMatrixAt(i, matrix);

		matrix.compose(dqSamples1[i].getTranslation(), dqSamples1[i].getRotation(), scale);
		conesBezier1.setMatrixAt(i, matrix);

		matrix.compose(dqSamples2[i].getTranslation(), dqSamples2[i].getRotation(), scale);
		conesBezier2.setMatrixAt(i, matrix);

		matrix.compose(dqSamples3[i].getTranslation(), dqSamples3[i].getRotation(), scale);
		conesBezier3.setMatrixAt(i, matrix);
	}
	conesBezier.instanceMatrix.needsUpdate = true;
}

bezierSamples()


function bezierSamples2() {
	const dqSamples = deCasteljauDQ(nbSamples, [dq3.clone(), dq2.clone(), dq1.clone(), dq0.clone()], false);

	const scale = new THREE.Vector3(0.5, 0.5, 0.5);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < dqSamples.length; ++i) {
		matrix.compose(dqSamples[i].getTranslation(), dqSamples[i].getRotation(), scale);
		conesBezier2.setMatrixAt(i, matrix);
	}
	conesBezier2.instanceMatrix.needsUpdate = true;
}

// bezierSamples2()


const conesFourPoints = new THREE.InstancedMesh(geometrySampleCone, cyan, 4096);
scene.add(conesFourPoints);

const cmap1 = new CMap1;
cmap1.createEmbedding(cmap1.vertex);

const cmapDQ = cmap1.addAttribute(cmap1.vertex, "dq");
const cmapPos = cmap1.addAttribute(cmap1.vertex, "position");

function fourPoints() {
	let vertex = cmap1.vertex;
	let fd = cmap1.addFace(4);
	cmapPos[cmap1.cell(vertex, fd)] = dq0.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq0.clone();
	fd = cmap1.phi1[fd]
	cmapPos[cmap1.cell(vertex, fd)] = dq1.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq1.clone();
	fd = cmap1.phi1[fd]
	cmapPos[cmap1.cell(vertex, fd)] = dq2.transform(world0);
	cmapDQ[cmap1.cell(vertex, fd)] = dq2.clone();
	fd = cmap1.phi1[fd]
	cmapPos[cmap1.cell(vertex, fd)] = dq3.transform(world0);
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
			cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi_1[vd])], 9/16)
			cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi1[vd])], 9/16)
			cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi([1, 1, 1], vd))], -1/16)
			cmapPos[vid].addScaledVector(cmapPos[cmap1.cell(vertex, cmap1.phi([-1, -1,-1], vd))], -1/16)

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
const fptsRenderer = new Renderer(cmap1)
fptsRenderer.vertices.create({color: new THREE.Color(0xff00ff)});
fptsRenderer.vertices.addTo(scene)

let gridDivs2 = 50;
function computeGrid() {
	let id = 0;
	const gridSamples = []
	const gridDivsSize = 1 / gridDivs2;
	const gridWeights = new THREE.Vector4()
	for(let i = 0; i <= gridDivs2; ++i) {
		for(let j = 0; j <= i; ++j) {
			for(let k = 0; k <= i - j; ++k) {
				gridWeights.set(1 - gridDivsSize * i, gridDivsSize * (i - j - k), gridDivsSize * j, gridDivsSize * k);
				const dqGrid = dq0.clone().multiplyScalar(gridWeights.x);
				dqGrid.addScaledDualQuaternion(dq1, gridWeights.y);
				dqGrid.addScaledDualQuaternion(dq2, gridWeights.z);
				dqGrid.addScaledDualQuaternion(dq3, gridWeights.w);
				dqGrid.normalize();
				gridSamples.push(dqGrid)
				++id;
			}
		}
	}
	console.log(id)

	return gridSamples

}


const conesTriGrid = new THREE.InstancedMesh(geometrySampleCone, cyan, 40000);
scene.add(conesTriGrid);


function setGrid() {
	const samples = computeGrid()
	const scale = new THREE.Vector3(0.125, 1, 0.125);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < samples.length; ++i){
		matrix.compose(samples[i].getTranslation(), samples[i].getRotation(), scale);
		conesTriGrid.setMatrixAt(i, matrix);
	}
}
// setGrid()







const conesLagrange = new THREE.InstancedMesh(geometrySampleSphere, magenta, nbSamples);
// scene.add(conesLagrange);

const conesLagrangeDQ = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
// scene.add(conesLagrangeDQ);



function nevilleAlgorithm(target) {
	const n = 4;

	const P = [dq0.transform(world0.clone()),
		dq1.transform(world0.clone()),
		dq2.transform(world0.clone()),
		dq3.transform(world0.clone())]

	const T = [0, 0.33, 0.66, 1]

	const p = new THREE.Vector3;

	for(let k = 1; k < n; ++k) {
		for(let i = 0; i < n - k; ++i) {
			const ti = T[i]
			const ti1 = T[i + k]

			const t = (target - ti) / (ti1 - ti)

			p.lerpVectors(P[i], P[i+1], t)
			P[i].copy(p);
		}
	}

	return P[0]
}

function nevilleAlgorithmDQ(target) {
	const n = 4;
	const P = [dq0.clone(), dq1.clone(), dq2.clone(), dq3.clone()]

	const T = [0, 0.333, 0.666, 1]
	const dq = new DualQuaternion;

	for(let k = 1; k < n; ++k) {
		for(let i = 0; i < n - k; ++i) {
			const ti = T[i]
			const ti1 = T[i + k]

			const t = (target - ti) / (ti1 - ti)

			dq.lerpDualQuaternions(P[i+1], P[i], t).normalize()
			P[i].copy(dq);

		}
	}

	return P[0]
}

function Lagrange() {
	const samplesDQ = []
	const samples = []
	for(let i = 0; i < nbSamples; ++i) {
		samplesDQ.push(nevilleAlgorithmDQ(i / (nbSamples-1)))
		samples.push(nevilleAlgorithm(i / (nbSamples-1)))
	}

	const scale = new THREE.Vector3(0.25, 1, 0.25);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < samplesDQ.length; ++i){
		matrix.compose(samplesDQ[i].getTranslation(), samplesDQ[i].getRotation(), scale);
		conesLagrangeDQ.setMatrixAt(i, matrix);
		matrix.makeTranslation(samples[i].x, samples[i].y, samples[i].z)
		conesLagrange.setMatrixAt(i, matrix);
	}
}

Lagrange()


const conesCatmullRom = new THREE.InstancedMesh(geometrySampleSphere, magenta, nbSamples);
// scene.add(conesCatmullRom);

const conesCatmullRomDQ = new THREE.InstancedMesh(geometrySampleCone, cyan, nbSamples);
// scene.add(conesCatmullRomDQ);


function catmullRomInterpolation(t, pts) {


	const t2 = t*t;
	const t3 = t*t2;

	const v0 = (-t3 + 2 * t2 - t) / 2;
	const v1 = (3 * t3 - 5 * t2 + 2) / 2;
	const v2 = (-3 * t3 + 4 * t2 + t) / 2;
	const v3 = (t3 - t2) / 2;

	const p = pts[0].clone().multiplyScalar(v0)
	p.add(pts[1].clone().multiplyScalar(v1))
	p.add(pts[2].clone().multiplyScalar(v2))
	p.add(pts[3].clone().multiplyScalar(v3))

	return p;
}

function catmullRomInterpolationDQ(t, pts) {
	const t2 = t*t;
	const t3 = t*t2;

	const v0 = (-t3 + 2 * t2 - t) / 2;
	const v1 = (3 * t3 - 5 * t2 + 2) / 2;
	const v2 = (-3 * t3 + 4 * t2 + t) / 2;
	const v3 = (t3 - t2) / 2;

	const p = pts[0].clone().multiplyScalar(v0)
	p.add(pts[1].clone().multiplyScalar(v1))
	p.add(pts[2].clone().multiplyScalar(v2))
	p.add(pts[3].clone().multiplyScalar(v3))

	return p.normalize();
}

function catmullRomSpline() {
	const samplesDQ = []
	const samples = []

	const pts0 = [	 dq0.transform(world0),	dq1.transform(world0), dq2.transform(world0), dq3.transform(world0)]
	const pts1 = [	 dq1.transform(world0),	dq2.transform(world0), dq3.transform(world0), dq0.transform(world0)]
	const pts2 = [	 dq2.transform(world0),	dq3.transform(world0), dq0.transform(world0), dq1.transform(world0)]
	const pts3 = [	 dq3.transform(world0),	dq0.transform(world0), dq1.transform(world0), dq2.transform(world0)]

	const dqs0 = [	 dq0.clone(),	dq1.clone(), dq2.clone(), dq3.clone()]
	const dqs1 = [	 dq1.clone(),	dq2.clone(), dq3.clone(), dq0.clone()]
	const dqs2 = [	 dq2.clone(),	dq3.clone(), dq0.clone(), dq1.clone()]
	const dqs3 = [	 dq3.clone(),	dq0.clone(), dq1.clone(), dq2.clone()]

	// const dqs0 = [	 dq0.clone(),	dq0.clone(), dq1.clone(), dq2.clone()]
	// const dqs1 = [	 dq0.clone(),	dq1.clone(), dq2.clone(), dq3.clone()]
	// const dqs2 = [	 dq1.clone(),	dq2.clone(), dq3.clone(), dq3.clone()]
	// const dqs3 = [	 dq1.clone(),	dq2.clone(), dq3.clone(), dq3.clone()]


	for(let i = 0; i < nbSamples / 4; ++i) {
		samples.push(catmullRomInterpolation(i / (nbSamples / 4), pts0))
		samples.push(catmullRomInterpolation(i / (nbSamples / 4), pts1))
		samples.push(catmullRomInterpolation(i / (nbSamples / 4), pts2))
		samples.push(catmullRomInterpolation(i / (nbSamples / 4), pts3))

		samplesDQ.push(catmullRomInterpolationDQ(i / (nbSamples / 4), dqs0))
		samplesDQ.push(catmullRomInterpolationDQ(i / (nbSamples / 4), dqs1))
		samplesDQ.push(catmullRomInterpolationDQ(i / (nbSamples / 4), dqs2))
		samplesDQ.push(catmullRomInterpolationDQ(i / (nbSamples / 4), dqs3))
	}


	const scale = new THREE.Vector3(0.25, 1, 0.25);
	const matrix = new THREE.Matrix4();
	for(let i = 0; i < samples.length; ++i){
		matrix.compose(samplesDQ[i].getTranslation(), samplesDQ[i].getRotation(), scale);
		conesCatmullRomDQ.setMatrixAt(i, matrix);
		matrix.makeTranslation(samples[i].x, samples[i].y, samples[i].z)
		conesCatmullRom.setMatrixAt(i, matrix);
	}
}
catmullRomSpline()




















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