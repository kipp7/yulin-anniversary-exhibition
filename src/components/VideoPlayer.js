import * as THREE from 'three';

/**
 * 视频播放器组件 - 在3D场景中播放视频
 */
export class VideoPlayer {
    constructor(scene) {
        this.scene = scene;
        this.videos = [];
        this.videoObjects = [];
    }

    /**
     * 自动检测并加载视频
     */
    async loadVideos() {
        // 直接使用7个视频路径，对应7个展区柱
        this.videos = [
            // 横屏宣传视频
            '/videos/video_玉林市师范学院东校区，新大门和新..._0 (1).mp4',  // [0] 历史长廊：新大门
            '/videos/video_让我们通过航拍熟悉一下，即将踏入..._0.mp4',      // [1] 建筑巡礼：航拍
            '/videos/1.mp4',                                                  // [2] 育人成果：四年时光（已重命名为1.mp4）
            '/videos/video_玉林师院第二十五届运动会，青春与..._0.mp4',      // [3] 文化传承：运动会
            '/videos/2.mp4',                                                  // [4] 数据之光：一镜到底（已重命名为2.mp4）
            '/videos/video_让我们通过航拍熟悉一下，即将踏入..._0.mp4',      // [5] 影像记忆：航拍（重复）
            '/videos/video_考不上名牌大学，玉林师院，也是不..._0.mp4',      // [6] 祝福留言：介绍
        ];

        console.log(`准备加载 ${this.videos.length} 个校园视频（包含重复）`);
        this.videos.forEach((path, index) => {
            const fileName = path.split('/').pop();
            console.log(`  ${index + 1}. ${fileName.substring(0, 30)}...`);
        });

        return this.videos;
    }

    /**
     * 创建视频屏幕（在特定位置播放视频）
     */
    createVideoScreen(videoPath, position, size = { width: 6, height: 4 }) {
        // 创建video元素
        const video = document.createElement('video');
        video.src = videoPath;
        video.loop = true;
        video.muted = true; // 静音自动播放
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        // 创建视频纹理
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        // 创建屏幕边框
        const frameGeometry = new THREE.BoxGeometry(size.width + 0.4, size.height + 0.4, 0.2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.copy(position);

        // 创建视频平面
        const screenGeometry = new THREE.PlaneGeometry(size.width, size.height);
        const screenMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 0.11; // 略微凸出边框
        frame.add(screen);

        // 添加到场景
        this.scene.add(frame);

        //
        this.videoObjects.push({
            frame,
            video,
            screen,
            isPlaying: false
        });

        console.log(`创建视频屏幕: ${videoPath}`);

        return { frame, video, screen };
    }

    /**
     * 在悬浮展区标识柱后面创建视频画廊
     */
    createVideoGallery(zoneMarkers, baseVideoHeight = 4) {
        if (this.videos.length === 0) {
            console.log('没有找到视频，跳过视频画廊创建');
            return null;
        }

        const videoCount = Math.min(this.videos.length, zoneMarkers.length);
        console.log(`在${videoCount}个悬浮展区柱后面创建视频屏幕`);

        this.videos.forEach((videoPath, index) => {
            if (index >= zoneMarkers.length) return;  // 视频数量超过柱子数量时跳过
            
            const marker = zoneMarkers[index];
            
            // 计算视频屏幕位置（在展区标识柱后面）
            // 从中心向外的方向向量
            const directionX = marker.position.x;
            const directionZ = marker.position.z;
            const distance = Math.sqrt(directionX * directionX + directionZ * directionZ);
            
            // 标准化方向向量
            const normX = directionX / distance;
            const normZ = directionZ / distance;
            
            // 视频放在柱子后面4米处（远离中心）
            const behindDistance = 4;
            const x = marker.position.x + normX * behindDistance;
            const z = marker.position.z + normZ * behindDistance;

            // 创建video元素
            const video = document.createElement('video');
            video.src = videoPath;
            video.loop = true;
            video.muted = true;  // 默认静音（切换到视频时会取消静音）
            video.volume = 0.5;  // 设置音量为50%
            video.playsInline = true;
            video.crossOrigin = 'anonymous';

            // 创建视频纹理
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            // 创建屏幕边框（浅灰金属质感）- 16:9横屏尺寸
            const frameWidth = 10;  // 宽度10米（调整更合理）
            const frameHeight = 5.625;  // 高度5.625米（保持16:9比例）
            const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.2);
            const frameMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,  // 浅灰色
                metalness: 0.7,
                roughness: 0.2,
                emissive: 0xe0e0e0,
                emissiveIntensity: 0.15
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            
            // 计算Y位置：确保视频底部在地面以上，完整显示
            const yPosition = baseVideoHeight + frameHeight / 2;
            frame.position.set(x, yPosition, z);

            // 让边框面向中心
            frame.lookAt(0, yPosition, 0);
            frame.castShadow = true;
            frame.receiveShadow = true;

            this.scene.add(frame);

            // 创建视频屏幕 - 16:9比例
            const screenGeometry = new THREE.PlaneGeometry(frameWidth - 0.5, frameHeight - 0.5);
            const screenMaterial = new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
                depthWrite: true,  // 确保深度写入
                depthTest: true,   // 确保深度测试
                color: 0x888888    // 降低亮度，避免过曝（0x888888 = 约53%亮度）
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.11;
            screen.renderOrder = 1;  // 设置渲染顺序，确保在前面
            frame.add(screen);

            // 添加视频说明标签（可选）- 已禁用
            // this.addVideoLabel(frame, `校园视频 ${index + 1}`);

            // 存储视频对象
            this.videoObjects.push({
                frame,
                video,
                screen,
                path: videoPath,
                isPlaying: false
            });

            console.log(`✅ 视频屏幕 ${index + 1} 创建成功: ${videoPath}`);
        });

        return this.videoObjects;
    }

    /**
     * 添加视频标签
     */
    addVideoLabel(frame, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#cccccc';  // 浅灰色背景
        context.fillRect(0, 0, 512, 64);
        
        context.fillStyle = '#333333';  // 深灰色文字
        context.font = 'Bold 32px Arial';
        context.textAlign = 'center';
        context.fillText(text, 256, 42);

        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(2, 0.25);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, -1.8, 0.11);
        frame.add(label);
    }

    /**
     * 播放所有视频（优化：只播放一个）
     * @param {number} onlyIndex - 只播放指定索引的视频，其他暂停（性能优化）
     */
    playAll(onlyIndex = -1) {
        this.videoObjects.forEach((obj, index) => {
            if (obj.video) {
                if (onlyIndex === -1 || index === onlyIndex) {
                    // 播放指定视频或全部播放
                    if (!obj.isPlaying) {
                        obj.video.play().catch(error => {
                            console.warn('视频自动播放被阻止:', error);
                        });
                        obj.isPlaying = true;
                    }
                } else {
                    // 暂停其他视频以节省资源
                    if (obj.isPlaying) {
                        obj.video.pause();
                        obj.isPlaying = false;
                    }
                }
            }
        });
        
        if (onlyIndex === -1) {
            console.log('🎬 开始播放所有视频');
        } else {
            console.log(`🎬 播放视频 ${onlyIndex + 1}，其他视频暂停`);
        }
    }

    /**
     * 暂停所有视频
     */
    pauseAll() {
        this.videoObjects.forEach(obj => {
            if (obj.video && obj.isPlaying) {
                obj.video.pause();
                obj.isPlaying = false;
            }
        });
        console.log('⏸️ 暂停所有视频');
    }

    /**
     * 播放指定视频
     */
    play(index) {
        if (this.videoObjects[index]) {
            const obj = this.videoObjects[index];
            obj.video.play().catch(error => {
                console.warn('视频播放失败:', error);
            });
            obj.isPlaying = true;
        }
    }

    /**
     * 暂停指定视频
     */
    pause(index) {
        if (this.videoObjects[index]) {
            const obj = this.videoObjects[index];
            obj.video.pause();
            obj.isPlaying = false;
        }
    }

    /**
     * 静音所有视频
     */
    muteAll() {
        this.videoObjects.forEach(obj => {
            if (obj.video) {
                obj.video.muted = true;
            }
        });
        console.log('🔇 所有视频静音');
    }

    /**
     * 取消静音指定视频（播放声音）
     */
    unmuteVideo(index) {
        if (this.videoObjects[index]) {
            this.videoObjects[index].video.muted = false;
            console.log(`🔊 视频 ${index + 1} 取消静音`);
        }
    }

    /**
     * 获取指定展区对应的视频索引
     * @param {string} zoneName - 展区名称 
     * @returns {number} - 视频索引
     */
    getVideoIndexByZone(zoneName) {
        const zoneToIndex = {
            'history': 0,      // 历史长廊
            'buildings': 1,    // 建筑巡礼
            'achievements': 2, // 育人成果
            'culture': 3,      // 文化传承
            'data': 4,         // 数据之光
            'memories': 5,     // 影像记忆
            'messages': 6      // 祝福留言
        };
        return zoneToIndex[zoneName] !== undefined ? zoneToIndex[zoneName] : -1;
    }

    /**
     * 更新（在动画循环中调用，保持视频纹理更新）
     */
    update() {
        // 视频纹理会自动更新，无需手动操作
    }

    /**
     * 清理资源
     */
    dispose() {
        this.videoObjects.forEach(obj => {
            if (obj.video) {
                obj.video.pause();
                obj.video.src = '';
            }
            if (obj.frame) {
                this.scene.remove(obj.frame);
            }
        });
        this.videoObjects = [];
        this.videos = [];
    }
}

