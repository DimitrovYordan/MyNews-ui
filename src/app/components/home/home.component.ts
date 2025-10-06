import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, 
  MeshStandardMaterial, Mesh, TextureLoader, AmbientLight, DirectionalLight, Color } from 'three';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private sphere!: Mesh;
  private animationId!: number;
  private globeTextureUrl = '/assets/world.topo.bathy.200411.3x5400x2700.jpg';

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initThree() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2.5;

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    window.addEventListener('resize', () => {
      const container = document.getElementById('globe-container');
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      this.renderer.setSize(newWidth, newHeight);
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
    });
    container.appendChild(this.renderer.domElement);

    const geometry = new SphereGeometry(1, 64, 64);

    const image = new Image();
    image.src = this.globeTextureUrl;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.5);     // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.5); // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.5); // B
      }
      ctx.putImageData(imageData, 0, 0);

      const loader = new TextureLoader();
      const texture = loader.load(canvas.toDataURL());

      const material = new MeshStandardMaterial({
        map: texture,
        color: new Color(0xffffff),
        emissive: new Color(0x222222),
        emissiveIntensity: 0.3
      });

      this.sphere = new Mesh(geometry, material);
      this.scene.add(this.sphere);

      const ambientLight = new AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(5, 3, 5);
      this.scene.add(directionalLight);
    };
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.sphere) {
      this.sphere.rotation.y += 0.002;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
