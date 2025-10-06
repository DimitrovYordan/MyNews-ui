import { Injectable } from "@angular/core";

import * as THREE from 'three';

@Injectable({
    providedIn: 'root'
})
export class GlobeService {
    private texture: THREE.Texture | null = null;
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private renderer: THREE.WebGLRenderer | null = null;
    private sphere: THREE.Mesh | null = null;
    private animationId: number | null = null;
    private globePicturePath: string = '/assets/land_shallow_topo_2048.jpg';

    constructor() { }

    async preload(): Promise<void> {
        if (!this.texture) {
            await this.getTexture();
        }
        if (!this.renderer) {
            const offscreen = document.createElement('div');
            offscreen.style.display = 'none';
            document.body.appendChild(offscreen);
            await this.initScene(offscreen);
        }
    }

    /**
     * Initialize the Three.js scene and attach it to the given container.
     * Reuses cached scene, renderer, and sphere if already initialized.
     */
    async initScene(container: HTMLDivElement): Promise<void> {
        if (this.scene && this.renderer) {
            // Attach existing renderer DOM element if not yet in container
            if (!container.contains(this.renderer.domElement)) {
                container.appendChild(this.renderer.domElement);
            }
            return;
        }

        const width = container.clientWidth || 200;
        const height = container.clientHeight || 200;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 2.5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height, false);
        container.appendChild(this.renderer.domElement);

        // Use slightly lower geometry resolution for faster rendering
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const texture = await this.getTexture();
        const material = new THREE.MeshStandardMaterial({ map: texture });

        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(3, 2, 3);
        this.scene.add(ambientLight, directionalLight);

        this.animate();
    }

    /**
     * Animate the globe. Automatically reuses cached sphere and renderer.
     */
    private animate = () => {
        if (!this.renderer || !this.scene || !this.camera) {
            return;
        }

        this.animationId = requestAnimationFrame(this.animate);

        if (this.sphere) {
            this.sphere.rotation.y += 0.02;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Load the globe texture with caching.
     */
    async getTexture(): Promise<THREE.Texture> {
        if (this.texture) {
            return this.texture;
        }

        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                this.globePicturePath,
                tex => {
                    this.texture = tex;
                    resolve(tex);
                },
                undefined,
                err => {
                    reject(err);
                }
            );
        });
    }

    /**
     * Dispose of the scene, renderer, and animation.
     */
    dispose(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.animationId = null;
    }
}
