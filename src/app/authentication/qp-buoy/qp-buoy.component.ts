import { Component, OnInit } from '@angular/core';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

@Component({
  selector: 'app-qp-buoy',
  standalone: true,
  imports: [],
  templateUrl: './qp-buoy.component.html',
  styleUrl: './qp-buoy.component.css'
})
export class QpBuoyComponent implements  OnInit {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private ship: THREE.Group | null = null;

  ngOnInit(): void {
    this.initScene();
    this.loadShipModel();
    this.animate();
  }

  private initScene() {
    const container = document.getElementById('containerr');
    if (!container) {
      console.error('Container element not found!');
      return;
    }
  
    this.scene = new THREE.Scene(); 
    // Remove any default background color
    this.scene.background = null;
  
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(95, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(10, 5, 15);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  
    // Enable transparency
    this.renderer = new THREE.WebGLRenderer({ alpha: true }); 
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0x000000, 0); // Fully transparent
    container.appendChild(this.renderer.domElement);
  
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);
  
    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      this.renderer.setSize(newWidth, newHeight);
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
    });
  }
  

  private loadShipModel() {
    const loader = new GLTFLoader();

    // Set up DracoLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('assets/3d/draco/javascript/');  // Point to the folder containing Draco decoder files
    dracoLoader.setDecoderConfig({type:'js'});

    loader.setDRACOLoader(dracoLoader);  // Set the DRACOLoader to the GLTFLoader

    loader.load(
      'assets/3d/buoy/buoy3.glb',  // Ensure you use a .glb file
      (gltf) => {
        this.ship = gltf.scene;
        this.ship.scale.set(3, 2.5, 3);
        this.scene.add(this.ship);
      },
      (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );
  }
  private targetRotationX: number = 0;  // Target pitch in degrees
  private targetRotationY: number = 0; // Target heading in degrees
  private targetRotationZ: number = 0;  // Target roll in degrees
  
  private rotationSpeed: number = 0.5;    // Speed of the rotation (adjust as needed)
  private rotating: boolean = false;    // Flag to indicate if rotation is in progress
  
  private waveTime: number = 0; // Time variable for wave animation

private animate() {
  requestAnimationFrame(() => this.animate());

  if (this.ship) {
    // Simulate floating movement using sine wave
    const waveHeight = 0; // Adjust height of the wave movement
    const waveSpeed = 0.05; // Adjust speed of floating motion
    const waveTilt = 0.02; // Adjust tilting effect

    this.waveTime += waveSpeed;

    // Apply vertical movement (floating effect)
    this.ship.position.y = Math.sin(this.waveTime) * waveHeight;

    // Apply tilting effect (rocking motion)
    this.ship.rotation.z = Math.sin(this.waveTime) * waveTilt;
    this.ship.rotation.x = Math.cos(this.waveTime * 0.3) * waveTilt; // Subtle pitch motion
  }

  this.renderer.render(this.scene, this.camera);
}

  
    public startRotation(pitch: number, heading: number, roll: number) {
      this.targetRotationX = pitch;
      this.targetRotationY = heading;
      this.targetRotationZ = roll;
      this.rotating = true; 
    }
  
  

    public updateShipMotion(pitch: number, roll: number, tilt: number, heading: number) {
      if (this.ship) {
        this.ship.rotation.x = THREE.MathUtils.degToRad(pitch);
        this.ship.rotation.z = THREE.MathUtils.degToRad(roll);
        this.ship.rotation.y = THREE.MathUtils.degToRad(heading);
      }
    }
}
