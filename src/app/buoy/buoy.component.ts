import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

@Component({
  selector: 'app-buoy',
  standalone:true,
  templateUrl: './buoy.component.html',
  styleUrls: ['./buoy.component.css'],
})
export class BuoyComponent implements OnInit {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private ship: THREE.Group | null = null;
  private rollingDirection: number = 1; 
  ngOnInit(): void {
    this.initScene();
    this.loadShipModel();
    this.animate();
    // setInterval(() => {
    //   this.rollingDirection *= -1; // Toggle direction
    //   this.targetRotationZ = this.rollingDirection * 10; // Set Z rotation to 10 or -10
    // }, 2000);
  }

  private initScene() {
    const container = document.getElementById('containerr');
    if (!container) {
      console.error('Container element not found!');
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.background = null;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(95, containerWidth / containerHeight, 0.1, 1000);
    this.camera.position.set(-20, 20,70); // Move camera further back
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Use ACES Filmic Tone Mapping
    this.renderer.toneMappingExposure = Math.pow(2, -3.91); // Apply exposure (converting to linear scale)
    
    this.renderer = new THREE.WebGLRenderer({alpha:true});
    this.renderer.setSize(containerWidth, containerHeight);
    container.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 10, 7);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Soft lighting
this.scene.add(ambientLight);

    this.scene.add(light);
    const directLight = new THREE.DirectionalLight(0xffffff, 4); // Directional light with intensity 4
    directLight.position.set(5, 10, 7); // Position the directional light
    directLight.color.set(0xffffff); // Set the color (white)
    
    // Add the directional light to the scene
    this.scene.add(directLight);
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
      'assets/3d/buoy2/qatar_buoy_assembly_13.02.25_13.03.25.glb',  // Ensure you use a .glb file
      (gltf) => {
        this.ship = gltf.scene;
        this.ship.scale.set(12, 12, 12);
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
  
  private rotationSpeed: number = 1;    // Speed of the rotation (adjust as needed)
  private rotating: boolean = false;    // Flag to indicate if rotation is in progress
  // waveTime:number = 0;
  private waveTime: number = 0; // Tracks the wave motion over time
private waveSpeed: number = 0.02; // Controls how fast the buoy moves
private waveHeight: number = 0.5; // Controls how high the buoy moves
private waveTilt: number = 0.02; // Controls the tilting effect

  private animate() {
    requestAnimationFrame(() => this.animate());
  
    if (this.ship && this.rotating) {
      const diffX = this.targetRotationX - THREE.MathUtils.radToDeg(this.ship.rotation.x);
      const diffY = this.targetRotationY - THREE.MathUtils.radToDeg(this.ship.rotation.y);
      const diffZ = this.targetRotationZ - THREE.MathUtils.radToDeg(this.ship.rotation.z);
  
      if (Math.abs(diffX) < 0.1 && Math.abs(diffY) < 0.1 && Math.abs(diffZ) < 0.1) {
        this.ship.rotation.x = THREE.MathUtils.degToRad(this.targetRotationX);
        this.ship.rotation.y = THREE.MathUtils.degToRad(this.targetRotationY);
        this.ship.rotation.z = THREE.MathUtils.degToRad(this.targetRotationZ);
        
        this.rotating = false; 
      } else {
        this.ship.rotation.x += THREE.MathUtils.degToRad(this.rotationSpeed * Math.sign(diffX));
        this.ship.rotation.y += THREE.MathUtils.degToRad(this.rotationSpeed * Math.sign(diffY));
        this.ship.rotation.z += THREE.MathUtils.degToRad(this.rotationSpeed * Math.sign(diffZ));
      

        // for (let i = 0; i < 2000; i++) {
        //   setInterval(() => {
        //     console.log(i);
        //   }, 4000);
        // }
        if (this.ship) {
          // 🌊 Simulate floating movement using a sine wave
          this.waveTime += this.waveSpeed; // Increment wave time
  
          // 1️⃣ Vertical Bobbing (Floating up & down)
          this.ship.position.y = Math.sin(this.waveTime) * this.waveHeight;
  
          // 2️⃣ Rolling Motion (Side-to-side tilting)
          this.ship.rotation.z = Math.sin(this.waveTime) * this.waveTilt; // Tilt left-right
  
          // 3️⃣ Pitching Motion (Forward-backward swaying)
          this.ship.rotation.x = Math.cos(this.waveTime * 0.6) * this.waveTilt; // Slightly forward-backward motion
  
          // 🎯 Optional: Yawing Motion (Heading Change for Realism)
          this.ship.rotation.y += Math.sin(this.waveTime * 0.2) * 0.0005; // Slight rotation on Y-axis
      }
          // this.ship!.rotation.z += THREE.MathUtils.degToRad(this.rotationSpeed * Math.sign(-10));
  
      }
    }
  this.startRotation(12, 109, -5);
  
    this.renderer.render(this.scene, this.camera);
  }
  
  public startRotation(pitch: number, heading: number, roll: number) {
    this.targetRotationX = 0;
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
