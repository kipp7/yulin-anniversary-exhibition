/**
 * 图片画廊组件 - 展示校园美景
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class ImageGallery {
    constructor(scene) {
        this.scene = scene;
        this.images = [];
        this.currentIndex = 0;
        this.imageObjects = [];
    }

    /**
     * 加载指定的3张悬浮照片
     */
    async loadImages() {
        // 精选3张悬浮照片（用户指定）
        const selectedPhotos = [
            '/images/campus/孔子圣像.jpg',
            '/images/campus/思源.jpg',
            '/images/campus/王力石像.jpg'
        ];
        
        console.log('🎨 加载精选悬浮照片（仅3张）...');
        
        const loadedImages = [];
        
        for (const imagePath of selectedPhotos) {
            try {
                // 验证图片是否存在且可加载
                const img = new Image();
                const canLoad = await new Promise((resolve) => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = imagePath;
                    setTimeout(() => resolve(false), 3000); // 3秒超时
                });
                
                if (canLoad) {
                    loadedImages.push(imagePath);
                    console.log(`✅ 加载成功: ${imagePath.split('/').pop()}`);
                } else {
                    console.warn(`⚠️ 加载失败: ${imagePath.split('/').pop()}`);
                }
            } catch (error) {
                console.warn(`❌ 图片加载错误: ${imagePath}`, error);
            }
        }

        this.images = loadedImages;
        console.log(`📸 精选悬浮照片加载完成，共 ${this.images.length} 张`);

        return loadedImages;
    }

    /**
     * 在展厅墙壁上铺满照片（环绕布局，自适应分辨率）⭐ 优化版
     */
    createWallGallery(wallRadius = 12, basePhotoHeight = 5) {
        if (this.images.length === 0) {
            console.log('⚠️ 没有找到图片，跳过墙壁画廊创建');
            return null;
        }

        const loader = new THREE.TextureLoader();
        const photoCount = this.images.length;
        
        console.log(`🎨 在墙壁上铺满 ${photoCount} 张照片（悬浮在展区柱间隙，完整显示）`);

        // 展区柱的角度位置（7个柱子，按角度排序）
        // 计算自 zoneMarkers 的实际位置
        const markerAngles = [
            0,          // 影像记忆 (25, 0)
            Math.PI / 4,      // 文化传承 (15, 15) = 45°
            Math.PI / 2,      // 祝福留言 (0, 25) = 90°
            Math.PI * 3 / 4,  // 育人成果 (-15, 15) = 135°
            Math.PI,          // 数据之光 (-25, 0) = 180°
            Math.PI * 5 / 4,  // 历史长廊 (-15, -15) = 225°
            Math.PI * 7 / 4   // 建筑巡礼 (15, -15) = 315°
        ];

        // 计算间隙角度（两个柱子之间的中点）
        const gapAngles = [];
        for (let i = 0; i < markerAngles.length; i++) {
            const nextIndex = (i + 1) % markerAngles.length;
            let angle1 = markerAngles[i];
            let angle2 = markerAngles[nextIndex];
            
            // 处理跨越360度的情况
            if (i === markerAngles.length - 1) {
                angle2 += Math.PI * 2;
            }
            
            const gapAngle = (angle1 + angle2) / 2;
            gapAngles.push(gapAngle);
        }

        console.log(`📍 照片将放置在 ${gapAngles.length} 个间隙位置，避开视频屏幕`);

        // 遍历所有照片并放置在间隙中
        this.images.forEach((imagePath, index) => {
            // 循环使用间隙角度
            const gapIndex = index % gapAngles.length;
            const baseAngle = gapAngles[gapIndex];
            
            // 如果照片数量超过间隙数量，在同一间隙内错开角度
            const layerOffset = Math.floor(index / gapAngles.length) * (Math.PI / 36); // 每层偏移5度
            const angle = baseAngle + layerOffset;
            
            const x = Math.cos(angle) * wallRadius;
            const z = Math.sin(angle) * wallRadius;

            // 先加载图片以获取真实分辨率
            const img = new Image();
            img.onload = () => {
                // 根据图片分辨率计算合适的尺寸
                const aspectRatio = img.width / img.height;
                let photoWidth, photoHeight;
                
                // 优化尺寸计算，确保图片清晰可见且完整
                const maxSize = 7; // 最大边长
                
                if (aspectRatio > 1.5) {
                    // 横图：宽度较大
                    photoWidth = maxSize;
                    photoHeight = photoWidth / aspectRatio;
                } else if (aspectRatio < 0.7) {
                    // 竖图：高度较大
                    photoHeight = maxSize;
                    photoWidth = photoHeight * aspectRatio;
                } else {
                    // 方图或标准比例
                    photoHeight = maxSize * 0.8;
                    photoWidth = photoHeight * aspectRatio;
                }

                // 创建相框（金色发光边框）
                const frameGeometry = new THREE.BoxGeometry(photoWidth + 0.4, photoHeight + 0.4, 0.15);
                const frameMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffd700,  // 金色
                    metalness: 0.8,
                    roughness: 0.2,
                    emissive: 0xffa500,  // 发光橙色
                    emissiveIntensity: 0.3
                });
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                
                // 计算Y位置：确保照片底部在地面以上，顶部不会太高
                const yPosition = basePhotoHeight + photoHeight / 2; // 基础高度 + 半个照片高度
                frame.position.set(x, yPosition, z);
                
                // 让相框面向中心
                frame.lookAt(0, yPosition, 0);
                frame.castShadow = true;
                frame.receiveShadow = true;

                // 添加呼吸动画
                const delay = index * 0.2; // 错开动画
                this.addBreathingAnimation(frame, delay);

                this.scene.add(frame);

                // 加载照片纹理
                loader.load(
                    imagePath,
                    (texture) => {
                        // 创建照片平面 - 使用真实比例
                        const photoGeometry = new THREE.PlaneGeometry(photoWidth, photoHeight);
                        const photoMaterial = new THREE.MeshStandardMaterial({
                            map: texture,
                            side: THREE.DoubleSide,
                            transparent: true,  // 支持透明度控制
                            opacity: 1
                        });
                        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
                        photo.position.z = 0.08;
                        frame.add(photo);

                        console.log(`✅ 照片 ${index + 1} 加载成功 (${img.width}x${img.height}, 比例${aspectRatio.toFixed(2)}): ${imagePath}`);
                    },
                    undefined,
                    (error) => {
                        console.error(`❌ 加载图片失败: ${imagePath}`, error);
                    }
                );

                // 不再为每张照片单独添加聚光灯，使用场景全局光照
                // this.addEnhancedSpotlight(x, z, yPosition);

                this.imageObjects.push(frame);
            };
            
            img.onerror = () => {
                console.error(`❌ 无法获取图片尺寸: ${imagePath}`);
            };
            
            img.src = imagePath;
        });

        return this.imageObjects;
    }

    /**
     * 为照片添加射灯效果
     */
    addPhotoSpotlight(x, z, photoHeight) {
        const spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(x * 0.9, photoHeight + 2, z * 0.9);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.decay = 2;
        spotLight.distance = 10;
        
        // 射灯照向照片
        spotLight.target.position.set(x, photoHeight, z);
        
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }

    /**
     * 创建图片墙（备用方法，网格排列）
     */
    createImageWall(position, spacing = 3) {
        if (this.images.length === 0) {
            console.log('⚠️ 没有找到图片，跳过图片墙创建');
            return null;
        }

        const loader = new THREE.TextureLoader();
        const group = new THREE.Group();

        this.images.forEach((imagePath, index) => {
            // 创建图片框架
            const frameGeometry = new THREE.BoxGeometry(2.5, 2, 0.1);
            const frameMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                metalness: 0.3,
                roughness: 0.7
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);

            // 加载图片作为纹理
            loader.load(
                imagePath,
                (texture) => {
                    // 创建图片平面
                    const imageGeometry = new THREE.PlaneGeometry(2.3, 1.8);
                    const imageMaterial = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide
                    });
                    const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
                    imagePlane.position.z = 0.06;
                    frame.add(imagePlane);

                    // 添加标签
                    this.addImageLabel(frame, `校园美景 ${index + 1}`);
                },
                undefined,
                (error) => {
                    console.error(`加载图片失败: ${imagePath}`, error);
                }
            );

            // 排列位置
            const x = (index % 3) * spacing - spacing;
            const y = Math.floor(index / 3) * -spacing + 2;
            frame.position.set(x, y, 0);
            frame.castShadow = true;

            group.add(frame);
            this.imageObjects.push(frame);
        });

        group.position.copy(position);
        this.scene.add(group);

        return group;
    }

    /**
     * 创建单张图片展示
     */
    createSingleImage(imagePath, position, size = { width: 4, height: 3 }) {
        const loader = new THREE.TextureLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(
                imagePath,
                (texture) => {
                    const geometry = new THREE.PlaneGeometry(size.width, size.height);
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide
                    });
                    const imagePlane = new THREE.Mesh(geometry, material);
                    imagePlane.position.copy(position);
                    
                    this.scene.add(imagePlane);
                    resolve(imagePlane);
                },
                undefined,
                reject
            );
        });
    }

    /**
     * 添加图片标签
     */
    addImageLabel(parent, text) {
        const labelGeometry = new THREE.PlaneGeometry(2.3, 0.3);
        const labelMaterial = new THREE.MeshBasicMaterial({
            color: 0xcccccc,  // 浅灰色标签
            transparent: true,
            opacity: 0.8
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, -1, 0.06);
        parent.add(label);
    }

    /**
     * 添加呼吸动画 - 让照片轻微浮动和缩放
     */
    addBreathingAnimation(frame, delay = 0) {
        const startY = frame.position.y;
        
        // 上下浮动动画
        gsap.to(frame.position, {
            y: startY + 0.3,
            duration: 2 + Math.random() * 0.5,
            delay: delay,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        
        // 轻微缩放动画
        gsap.to(frame.scale, {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 2 + Math.random() * 0.5,
            delay: delay,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    /**
     * 为照片添加增强射灯 - 更明亮
     */
    addEnhancedSpotlight(x, z, height) {
        // 主光源 - 白色强光
        const mainLight = new THREE.SpotLight(0xffffff, 1.5);
        mainLight.position.set(x * 1.15, height + 4, z * 1.15);
        mainLight.angle = Math.PI / 5;
        mainLight.penumbra = 0.4;
        mainLight.decay = 1.5;
        mainLight.distance = 20;
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // 补光 - 暖色调
        const fillLight = new THREE.PointLight(0xffd700, 0.8, 12);
        fillLight.position.set(x * 0.9, height, z * 0.9);
        this.scene.add(fillLight);
    }

    /**
     * 检查图片是否存在
     */
    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

