/**
 * 粒子系统 - 创建璀璨的粒子特效
 */

import * as THREE from 'three';

// 创建圆形粒子纹理
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // 创建径向渐变
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createParticleSystem(scene) {
    const particleCount = 1200; // 增加粒子数量，更丰富的视觉效果
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color(0xff6b6b),  // 红色
        new THREE.Color(0xffd93d),  // 黄色
        new THREE.Color(0xffd700),  // 金色
        new THREE.Color(0xffaa00),  // 橙金色
        new THREE.Color(0x6bcf7f),  // 绿色
        new THREE.Color(0x4ecdc4),  // 青色
        new THREE.Color(0xc77dff),  // 紫色
        new THREE.Color(0xffffff)   // 白色（闪烁星光）
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 随机位置（扩大范围）
        positions[i3] = (Math.random() - 0.5) * 120;
        positions[i3 + 1] = Math.random() * 60;
        positions[i3 + 2] = (Math.random() - 0.5) * 120;

        // 随机颜色（增加金色系粒子）
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        // 随机大小（更多样化）
        sizes[i] = Math.random() * 3 + 0.3;

        // 随机速度（更多变化）
        velocities[i3] = (Math.random() - 0.5) * 0.03;
        velocities[i3 + 1] = Math.random() * 0.06 + 0.01;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.03;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        depthWrite: false,
        map: createParticleTexture()  // 使用自定义纹理
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 鼠标位置
    let mouseX = 0;
    let mouseY = 0;

    return {
        update() {
            const positions = particles.geometry.attributes.position.array;

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                // 更新位置
                positions[i3] += velocities[i3];
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];

                // 鼠标吸引效果
                const dx = mouseX * 20 - positions[i3];
                const dy = mouseY * 20 - positions[i3 + 1];
                positions[i3] += dx * 0.001;
                positions[i3 + 1] += dy * 0.001;

                // 边界检测 - 循环（适应新的范围）
                if (positions[i3 + 1] > 60) {
                    positions[i3 + 1] = 0;
                }
                if (Math.abs(positions[i3]) > 60) {
                    positions[i3] = (Math.random() - 0.5) * 120;
                }
                if (Math.abs(positions[i3 + 2]) > 60) {
                    positions[i3 + 2] = (Math.random() - 0.5) * 120;
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;

            // 整体旋转
            particles.rotation.y += 0.0005;
        },

        updateMousePosition(x, y) {
            mouseX = x;
            mouseY = y;
        }
    };
}

