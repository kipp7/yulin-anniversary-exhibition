/**
 * 墙壁纹理管理器 - 为展厅墙壁添加精美照片装饰
 */

import * as THREE from 'three';

export class WallTextureManager {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.wallTextures = [];
        
        // 精选墙壁照片列表（按美观度和主题分组）
        this.photoList = [
            // 标志性建筑（4张）
            '/images/campus/大本钟.jpg',
            '/images/campus/图书馆.webp',
            '/images/campus/新民楼.jpg',
            '/images/campus/校史馆.jpg',
            
            // 文化景观（4张）
            '/images/campus/孔子像.jpg',
            '/images/campus/学如磐石.jpg',
            '/images/campus/思源.jpg',
            '/images/campus/厚德博学 知行合一.jpg',
            
            // 校园风光（4张）
            '/images/campus/音乐喷泉1.jpg',
            '/images/campus/图书馆前面仿真音乐钢琴.jpg',
            '/images/campus/文科实训中心.jpg',
            '/images/campus/梅园宿舍.jpg'
        ];
    }

    /**
     * 加载所有墙壁纹理
     */
    async loadTextures() {
        console.log('🎨 开始加载墙壁装饰照片...');
        
        const loadPromises = this.photoList.map((path, index) => {
            return new Promise((resolve) => {
                this.textureLoader.load(
                    path,
                    (texture) => {
                        // 纹理加载成功
                        texture.encoding = THREE.sRGBEncoding;
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        
                        console.log(`✅ 墙壁照片 ${index + 1}/12 加载成功: ${path.split('/').pop()}`);
                        this.wallTextures.push(texture);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn(`⚠️ 墙壁照片加载失败: ${path}`, error);
                        // 加载失败时使用纯色纹理
                        const canvas = document.createElement('canvas');
                        canvas.width = 512;
                        canvas.height = 512;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#e0e0e0';
                        ctx.fillRect(0, 0, 512, 512);
                        
                        const fallbackTexture = new THREE.CanvasTexture(canvas);
                        this.wallTextures.push(fallbackTexture);
                        resolve(fallbackTexture);
                    }
                );
            });
        });

        await Promise.all(loadPromises);
        console.log(`🎉 墙壁装饰照片加载完成，共 ${this.wallTextures.length} 张`);
    }

    /**
     * 应用纹理到展厅墙壁
     */
    applyToWalls() {
        console.log('🖼️ 开始为墙壁应用照片装饰...');
        
        // 查找场景中的墙壁对象
        const walls = this.findWalls();
        
        if (walls.length === 0) {
            console.warn('⚠️ 未找到墙壁对象！');
            return;
        }

        console.log(`📐 找到 ${walls.length} 面墙壁`);

        // 为每面墙应用对应的纹理
        walls.forEach((wall, index) => {
            if (index < this.wallTextures.length) {
                const texture = this.wallTextures[index];
                
                // 创建新材质（保留原有的光照属性）
                const photoMaterial = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.1,
                    roughness: 0.6,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.05,
                    side: THREE.DoubleSide
                });

                // 替换墙壁材质
                if (wall.material) {
                    wall.material.dispose(); // 释放旧材质
                }
                wall.material = photoMaterial;
                
                console.log(`✅ 墙壁 ${index + 1} 应用照片: ${this.photoList[index].split('/').pop()}`);
            }
        });

        console.log('🎊 墙壁照片装饰完成！');
    }

    /**
     * 查找场景中的墙壁对象
     * 墙壁特征：BoxGeometry，高度约10米，宽度约20米
     */
    findWalls() {
        const walls = [];
        
        this.scene.traverse((object) => {
            if (object.isMesh && object.geometry.type === 'BoxGeometry') {
                // 获取边界框
                object.geometry.computeBoundingBox();
                const box = object.geometry.boundingBox;
                const width = box.max.x - box.min.x;
                const height = box.max.y - box.min.y;
                const depth = box.max.z - box.min.z;
                
                // 判断是否为墙壁（高度约10米，宽度约20米，厚度约0.5米）
                const isWall = (
                    height > 8 && height < 12 &&     // 高度 9-11米
                    width > 15 && width < 25 &&      // 宽度 16-24米
                    depth < 1                         // 厚度 < 1米
                );
                
                if (isWall) {
                    walls.push(object);
                }
            }
        });

        // 按照墙壁的角度排序（从0度到360度）
        walls.sort((a, b) => {
            const angleA = Math.atan2(a.position.z, a.position.x);
            const angleB = Math.atan2(b.position.z, b.position.x);
            return angleA - angleB;
        });

        return walls;
    }

    /**
     * 添加照片边框装饰效果
     */
    addPhotoFrameEffect(wall, index) {
        // 创建相框边框（金色）
        const frameThickness = 0.3;
        const frameGeometry = new THREE.BoxGeometry(
            wall.geometry.parameters.width + frameThickness * 2,
            wall.geometry.parameters.height + frameThickness * 2,
            0.1
        );
        
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xffd700,
            emissiveIntensity: 0.1
        });

        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.copy(wall.position);
        frame.rotation.copy(wall.rotation);
        frame.position.z -= 0.15; // 稍微后移，让相框在墙壁后面
        
        this.scene.add(frame);
    }

    /**
     * 获取照片信息（用于调试）
     */
    getPhotoInfo() {
        return this.photoList.map((path, index) => ({
            index: index + 1,
            name: path.split('/').pop(),
            path: path,
            loaded: index < this.wallTextures.length
        }));
    }

    /**
     * 释放资源
     */
    dispose() {
        this.wallTextures.forEach(texture => {
            if (texture) {
                texture.dispose();
            }
        });
        this.wallTextures = [];
        console.log('🗑️ 墙壁纹理资源已释放');
    }
}

