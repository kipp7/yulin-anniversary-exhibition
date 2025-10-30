/**
 * 八秩芳华·数字时光馆 - 主入口文件
 * 玉林师范学院80周年校庆虚拟展览系统
 * 
 * 本作品使用AI辅助部分代码编写
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { createParticleSystem } from './particles.js';
import { createExhibitionHall } from './scenes/exhibitionHall.js';
import { createTimeline } from './scenes/timeline.js';
import { createDataVisualization } from './scenes/dataVisualization.js';
import { AudioManagerEnhanced as AudioManager } from './audio-enhanced.js';
import { ImageGallery } from './components/ImageGallery.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { ContentCardDisplay } from './components/ContentCardDisplay.js';
import { ImageTransparencyController } from './components/ImageTransparencyController.js';
import { WallTextureManager } from './components/WallTextureManager.js';
import { CreditsPage } from './components/CreditsPage.js';
import { schoolData } from './data/schoolData.js';

class YulinExhibition {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        this.particleSystem = null;
        this.audioManager = null;
        this.imageGallery = null;
        this.videoPlayer = null;
        this.contentCardDisplay = null;
        this.imageTransparencyController = null;
        this.wallTextureManager = null;
        this.currentZone = 'welcome';
        this.loadingProgress = 0;
        
        this.init();
    }

    async init() {
        // 显示加载进度
        this.updateLoadingProgress(10, '初始化场景...');
        
        // 创建场景
        this.createScene();
        this.updateLoadingProgress(20, '创建相机...');
        
        // 创建相机
        this.createCamera();
        this.updateLoadingProgress(30, '设置渲染器...');
        
        // 创建渲染器
        this.createRenderer();
        this.updateLoadingProgress(40, '添加灯光...');
        
        // 创建灯光
        this.createLights();
        this.updateLoadingProgress(50, '加载展厅...');
        
        // 创建控制器
        this.createControls();
        this.updateLoadingProgress(60, '创建特效...');
        
        // 创建后期处理
        this.createPostProcessing();
        this.updateLoadingProgress(70, '添加粒子效果...');
        
        // 创建粒子系统
        this.particleSystem = createParticleSystem(this.scene);
        this.updateLoadingProgress(80, '加载音频...');
        
        // 创建展览内容
        this.createExhibitionContent();
        this.updateLoadingProgress(82, '装饰墙壁...');
        
        // 初始化并应用墙壁纹理
        this.wallTextureManager = new WallTextureManager(this.scene);
        await this.wallTextureManager.loadTextures();
        this.wallTextureManager.applyToWalls();
        
        this.updateLoadingProgress(85, '加载图片...');
        
            // 初始化图片画廊
            this.imageGallery = new ImageGallery(this.scene);
            await this.imageGallery.loadImages();
            this.createImageDisplays();
            
            // 初始化图片透明度控制器
            this.imageTransparencyController = new ImageTransparencyController(this.camera);
            if (this.imageGallery && this.imageGallery.imageObjects.length > 0) {
                this.imageTransparencyController.addImages(this.imageGallery.imageObjects);
                console.log(`图片透明度控制器已启用，管理 ${this.imageGallery.imageObjects.length} 张图片`);
            }
            
            // 初始化内容卡片展示
            this.contentCardDisplay = new ContentCardDisplay(this.scene, this.camera);
            
            // 初始化视频播放器
            this.videoPlayer = new VideoPlayer(this.scene);
            await this.videoPlayer.loadVideos();
            this.createVideoDisplays();
            
            this.updateLoadingProgress(90, '准备就绪...');
        
        // 初始化音频
        this.audioManager = new AudioManager();
        await this.audioManager.init();
        
        // 初始化致谢页面
        this.creditsPage = new CreditsPage();
        console.log('致谢页面已初始化（按F1或C键查看）');
        
        // 绑定事件
        this.bindEvents();
        
        // 完成加载
        this.updateLoadingProgress(100, '加载完成！');
        setTimeout(() => {
            this.hideLoading();
            this.showMusicStartOverlay();
            this.startAnimation();
        }, 500);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffeaa7);  // 暖金色背景（党政风格）
        this.scene.fog = new THREE.Fog(0xffd7a8, 50, 200);  // 暖色雾效
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance' // 优化：使用高性能模式
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // 优化：限制像素比为1.5，大幅提升性能（视觉差异不大）
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    createLights() {
        // 环境光 - 柔和亮度
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // 主光源 - 适中
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -50;
        mainLight.shadow.camera.right = 50;
        mainLight.shadow.camera.top = 50;
        mainLight.shadow.camera.bottom = -50;
        this.scene.add(mainLight);

        // 补光 - 柔和
        const fillLight = new THREE.DirectionalLight(0xffd700, 0.4);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);
        
        // 额外顶部光源 - 柔和照明
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
        topLight.position.set(0, 30, 0);
        this.scene.add(topLight);

        // 点光源 - 红芯效果（降低亮度）
        const redLight = new THREE.PointLight(0xff6b6b, 1.5, 30);
        redLight.position.set(0, 3, 0);
        this.scene.add(redLight);
        
        // 动画红光
        gsap.to(redLight, {
            intensity: 3,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // 缩放距离限制：允许放大靠近看视频，严格限制缩小防止穿墙
        this.controls.minDistance = 3;      // 最近3米（可以靠近观看视频细节）
        this.controls.maxDistance = 28;     // 最远28米（墙壁在30米，留2米安全距离）
        this.controls.zoomSpeed = 0.8;      // 缩放速度适中
        
        // 水平旋转：完全自由，360度无限制
        this.controls.minAzimuthAngle = -Infinity;  // 无限制
        this.controls.maxAzimuthAngle = Infinity;   // 无限制
        
        // 严格限制垂直旋转角度，完全防止穿模
        this.controls.minPolarAngle = Math.PI / 3;      // 向上最多60度（不能看到天花板外）
        this.controls.maxPolarAngle = Math.PI / 2.1;    // 向下不能到地平线
        
        // 自动旋转：默认关闭，用户可以自由控制
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.3;
        
        // 添加事件监听：用户开始交互时停止自动旋转
        this.controls.addEventListener('start', () => {
            this.controls.autoRotate = false;
        });
    }

    createPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // 强度
            0.4,  // 半径
            0.85  // 阈值
        );
        this.composer.addPass(bloomPass);
    }

    createExhibitionContent() {
        // 创建展览大厅
        const hall = createExhibitionHall(this.scene);
        
        // 创建党政风格地面（米黄色）
        const groundGeometry = new THREE.CircleGeometry(50, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5deb3,  // 米黄色地面（党政风格）
            roughness: 0.5,
            metalness: 0.3,
            emissive: 0xffd700,
            emissiveIntensity: 0.08
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 添加网格辅助线（浅灰色网格）
        const gridHelper = new THREE.GridHelper(100, 50, 0xcccccc, 0xe8e8e8);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // 创建中心"红芯"装置
        this.createRedHeartCenter();
        
        // 创建展区标识
        this.createZoneMarkers();
    }

    createRedHeartCenter() {
        // 创建玉林师范学院校徽3D模型
        const logoGroup = new THREE.Group();

        // 1. 外圈盾牌底座
        const shieldGeometry = new THREE.CylinderGeometry(2.5, 2.8, 0.3, 6);
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: 0xc41e3a,  // 深红色
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x8b0000,
            emissiveIntensity: 0.4
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.rotation.y = Math.PI / 6;
        logoGroup.add(shield);

        // 2. 中间圆盘（书籍基座）
        const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.4, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,  // 金色
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xffa500,
            emissiveIntensity: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.35;
        logoGroup.add(base);

        // 3. 书籍层次（代表知识）
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.6,
            emissive: 0xaaaaff,
            emissiveIntensity: 0.2
        });

        // 三本叠加的书
        for (let i = 0; i < 3; i++) {
            const bookGeometry = new THREE.BoxGeometry(2.5, 0.15, 1.5);
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.y = 0.7 + i * 0.2;
            book.rotation.y = (i * Math.PI / 6) - Math.PI / 6;
            logoGroup.add(book);
        }

        // 4. 中心火炬（象征"红芯"主题）
        const torchGeometry = new THREE.ConeGeometry(0.3, 1.2, 8);
        const torchMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            metalness: 0.5,
            roughness: 0.3,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        });
        const torch = new THREE.Mesh(torchGeometry, torchMaterial);
        torch.position.y = 1.8;
        logoGroup.add(torch);

        // 5. 火焰效果（顶部）
        const flameGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 2.5;
        flame.scale.set(1, 1.5, 1);
        logoGroup.add(flame);

        // 6. 装饰星星（四周）
        const starMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffaa00,
            emissiveIntensity: 0.6
        });

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const starGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.x = Math.cos(angle) * 2.8;
            star.position.z = Math.sin(angle) * 2.8;
            star.position.y = 1.2;
            logoGroup.add(star);
        }

        // 整体位置和缩放
        logoGroup.position.set(0, 2, 0);
        logoGroup.scale.set(1, 1, 1);
        this.scene.add(logoGroup);

        // 动画 - 缓慢旋转 + 呼吸效果
        gsap.to(logoGroup.rotation, {
            y: Math.PI * 2,
            duration: 30,
            repeat: -1,
            ease: 'none'
        });

        gsap.to(logoGroup.scale, {
            x: 1.15,
            y: 1.15,
            z: 1.15,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // 火焰闪烁动画
        gsap.to(flame.scale, {
            x: 1.2,
            y: 1.8,
            z: 1.2,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        gsap.to(flameMaterial, {
            opacity: 0.5,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // 添加光环
        const ringGeometry = new THREE.TorusGeometry(3, 0.1, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            emissive: 0xff0000,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(0, 2, 0);
        ring.rotation.x = Math.PI / 2;
        this.scene.add(ring);

        gsap.to(ring.rotation, {
            z: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: 'none'
        });
    }

    /**
     * 创建图片展示 - 悬挂在墙壁上（圆形画廊）
     */
    createImageDisplays() {
        if (this.imageGallery && this.imageGallery.images.length > 0) {
            console.log(`在展厅墙壁上悬挂照片，共 ${this.imageGallery.images.length} 张`);
            
            //
            //
            //
            this.imageGallery.createWallGallery(20, 2.5);
        } else {
            console.log('未找到图片，跳过照片悬挂');
        }
    }

    /**
     * 创建视频展示 - 在墙壁上创建视频屏幕
     */
    createVideoDisplays() {
        if (this.videoPlayer && this.videoPlayer.videos.length > 0 && this.zoneMarkers) {
            console.log(`在悬浮展区柱后面创建视频屏幕，共 ${this.videoPlayer.videos.length} 个`);
            
            //
            //
            //
            this.videoPlayer.createVideoGallery(this.zoneMarkers, 4);
            
            //
            console.log('性能优化：视频默认不播放，切换到展区时再播放');
        } else {
            console.log('未找到视频或展区标识，跳过视频屏幕创建');
        }
    }

    createZoneMarkers() {
        this.zoneMarkers = [
            { name: '历史长廊', position: new THREE.Vector3(-15, 0, -15), color: 0xffd93d },
            { name: '建筑巡礼', position: new THREE.Vector3(15, 0, -15), color: 0x6bcf7f },
            { name: '育人成果', position: new THREE.Vector3(-15, 0, 15), color: 0x4ecdc4 },
            { name: '文化传承', position: new THREE.Vector3(15, 0, 15), color: 0xc77dff },
            { name: '数据之光', position: new THREE.Vector3(-25, 0, 0), color: 0xff6b6b },
            { name: '影像记忆', position: new THREE.Vector3(25, 0, 0), color: 0xf72585 },
            { name: '祝福留言', position: new THREE.Vector3(0, 0, 25), color: 0xffa500 }
        ];
        
        const zones = this.zoneMarkers;

        zones.forEach(zone => {
            // 创建柱子
            const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
            const material = new THREE.MeshStandardMaterial({
                color: zone.color,
                emissive: zone.color,
                emissiveIntensity: 0.5,
                metalness: 0.5,
                roughness: 0.3
            });
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.copy(zone.position);
            cylinder.position.y = 2;
            cylinder.castShadow = true;
            cylinder.userData = { zoneName: zone.name };
            this.scene.add(cylinder);

            // 添加浮动动画
            gsap.to(cylinder.position, {
                y: 2.5,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random()
            });

            // 添加旋转光环
            const ringGeo = new THREE.TorusGeometry(1, 0.05, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: zone.color,
                transparent: true,
                opacity: 0.6
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(zone.position);
            ring.position.y = 0.1;
            ring.rotation.x = -Math.PI / 2;
            this.scene.add(ring);

            gsap.to(ring.rotation, {
                z: Math.PI * 2,
                duration: 3,
                repeat: -1,
                ease: 'none'
            });
        });
    }

    bindEvents() {
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());

        // 导航按钮点击
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const zone = e.target.dataset.zone;
                this.switchZone(zone);
            });
        });

        // 音频控制
        const audioControl = document.getElementById('audio-control');
        audioControl.addEventListener('click', () => {
            this.audioManager.toggleMusic();
            const audioType = this.audioManager.getAudioType ? this.audioManager.getAudioType() : '音乐';
            audioControl.textContent = this.audioManager.isMusicPlaying() 
                ? `🔊 ${audioType}：开启` 
                : `🔇 ${audioType}：关闭`;
        });
        
        // 显示当前音频类型
        setTimeout(() => {
            if (this.audioManager.getAudioType) {
                const audioType = this.audioManager.getAudioType();
                audioControl.textContent = `🔊 ${audioType}：关闭`;
            }
        }, 1000);

        // 鼠标移动 - 粒子跟随
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            if (this.particleSystem) {
                this.particleSystem.updateMousePosition(x, y);
            }
        });

        // 点击事件 - 交互
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onCanvasClick(event);
        });
    }

    onCanvasClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // 优先检查内容卡片点击（用于关闭卡片）
            if (this.contentCardDisplay && this.contentCardDisplay.handleClick(object)) {
                this.audioManager.playClick();
                return;
            }
            
            if (object.userData.zoneName) {
                this.showInfo(object.userData.zoneName, this.getZoneInfo(object.userData.zoneName));
                this.audioManager.playClick();
            }
        }
    }

    getZoneName(zone) {
        const nameMap = {
            'history': '历史长廊',
            'buildings': '建筑巡礼',
            'achievements': '育人成果',
            'culture': '文化传承',
            'data': '数据之光',
            'memories': '影像记忆',
            'messages': '祝福留言'
        };
        return nameMap[zone] || zone;
    }

    getZoneInfo(zoneName) {
        const zoneInfoMap = {
            '历史长廊': schoolData.history,
            '建筑巡礼': schoolData.buildings,
            '育人成果': schoolData.achievements,
            '文化传承': schoolData.culture,
            '数据之光': schoolData.dataStats,
            '影像记忆': schoolData.memories,
            '祝福留言': schoolData.messages
        };
        
        return zoneInfoMap[zoneName] || '展区介绍加载中...';
    }

    showInfo(title, content) {
        const panel = document.getElementById('info-panel');
        const titleEl = document.getElementById('info-title');
        const contentEl = document.getElementById('info-content');

        titleEl.textContent = title;
        contentEl.innerHTML = content;
        panel.classList.add('show');
    }

    switchZone(zone) {
        console.log(`switchZone 被调用 - 目标: ${zone}, 当前: ${this.currentZone}`);
        
        //
        if (this.controls && this.controls.autoRotate) {
            this.controls.autoRotate = false;
            console.log('停止自动旋转');
        }
        
        //
        if (this.currentZone === zone) {
            console.log(`已在 ${zone} 展区，保持视角不变`);
            //
            if (zone !== 'welcome') {
                const zoneName = this.getZoneName(zone);
                const zoneContent = this.getZoneInfo(zoneName);
                this.showInfo(zoneName, zoneContent);
            }
            return;
        }
        
        console.log(`切换展区：${this.currentZone} → ${zone}`);
        this.currentZone = zone;
        
        // 更新按钮状态
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.zone === zone) {
                btn.classList.add('active');
            }
        });

        //
        const zoneToMarkerIndex = {
            welcome: -1,
            history: 0,      //
            buildings: 1,    //
            achievements: 2, //
            culture: 3,      //
            data: 4,         //
            memories: 5,     //
            messages: 6      //
        };

        const markerIndex = zoneToMarkerIndex[zone];
        
        if (zone === 'welcome') {
            // 欢迎界面：回到中心全景视角（更平滑的过渡）
            gsap.to(this.camera.position, {
                x: 0,
                y: 5,
                z: 15,
                duration: 2.5,  // 延长到2.5秒，更平滑
                ease: 'power1.inOut'  // 更柔和的缓动
            });
            
            gsap.to(this.controls.target, {
                x: 0,
                y: 2,
                z: 0,
                duration: 2.5,  // 延长到2.5秒
                ease: 'power1.inOut'
            });

            //
            if (this.audioManager) {
                this.audioManager.resumeSchoolSong();
                //
                const audioControl = document.getElementById('audio-control');
                if (audioControl) {
                    audioControl.textContent = '🔊 校歌：播放中';
                }
            }
            if (this.videoPlayer) {
                this.videoPlayer.pauseAll();
                console.log('回到欢迎大厅，所有视频已暂停');
            }
        } else if (markerIndex >= 0 && this.zoneMarkers && this.zoneMarkers[markerIndex]) {
            // 其他展区：飞到对应视频屏幕前面
            const marker = this.zoneMarkers[markerIndex];
            
            // 计算从中心到标记的方向
            const directionX = marker.position.x;
            const directionZ = marker.position.z;
            const distance = Math.sqrt(directionX * directionX + directionZ * directionZ);
            const normX = directionX / distance;
            const normZ = directionZ / distance;
            
            //
            const videoX = marker.position.x + normX * 4;
            const videoZ = marker.position.z + normZ * 4;
            const videoY = 4;
            
            //
            const cameraDistance = 12;
            const cameraX = videoX - normX * cameraDistance;
            const cameraZ = videoZ - normZ * cameraDistance;
            const cameraY = 4.5;
            
            console.log(`飞向${marker.name}的视频屏幕 - 屏幕位置:(${videoX.toFixed(1)}, ${videoY}, ${videoZ.toFixed(1)}), 相机位置:(${cameraX.toFixed(1)}, ${cameraY}, ${cameraZ.toFixed(1)})`);
            
            // 相机飞到视频屏幕前面（更平滑的过渡）
            gsap.to(this.camera.position, {
                x: cameraX,
                y: cameraY,
                z: cameraZ,
                duration: 2.5,  // 延长到2.5秒，更平滑
                ease: 'power1.inOut',  // 更柔和的缓动
                onComplete: () => {
                    // 相机移动完成后，显示右下角信息面板
                    setTimeout(() => {
                        const zoneName = this.getZoneName(zone);
                        const zoneContent = this.getZoneInfo(zoneName);
                        this.showInfo(zoneName, zoneContent);
                    }, 300);
                }
            });
            
            // 控制器目标指向视频屏幕中心
            gsap.to(this.controls.target, {
                x: videoX,
                y: videoY,
                z: videoZ,
                duration: 2.5,  // 延长到2.5秒
                ease: 'power1.inOut'
            });

            //
            if (this.audioManager) {
                this.audioManager.stopSchoolSong();
                //
                const audioControl = document.getElementById('audio-control');
                if (audioControl) {
                    audioControl.textContent = '🎬 视频声音：播放中';
                }
            }
            if (this.videoPlayer) {
                const videoIndex = this.videoPlayer.getVideoIndexByZone(zone);
                if (videoIndex >= 0) {
                    //
                    this.videoPlayer.playAll(videoIndex);
                    this.videoPlayer.muteAll();
                    this.videoPlayer.unmuteVideo(videoIndex);
                    console.log(`切换到展区 ${zone}，只播放视频 ${videoIndex + 1}`);
                }
            }
        }

        this.audioManager.playSwitch();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    updateLoadingProgress(progress, text) {
        this.loadingProgress = progress;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('loading-text').textContent = text;
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }

    showMusicStartOverlay() {
        const overlay = document.getElementById('music-start-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideMusicStartOverlay() {
        const overlay = document.getElementById('music-start-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }


    startAnimation() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        //
        this.controls.update();
        
        //
        //
        this.controls.minPolarAngle = Math.PI / 3;
        this.controls.maxPolarAngle = Math.PI / 2.1;

        //
        if (this.particleSystem) {
            this.particleSystem.update();
        }

        //
        // if (this.imageTransparencyController) {
        //     this.imageTransparencyController.update();
        // }

        // 渲染
        this.composer.render();
    }
}

// 全局变量，用于存储应用实例
let appInstance = null;

// 全局函数
window.closeInfoPanel = function() {
    document.getElementById('info-panel').classList.remove('show');
};

// 显示致谢名单的全局函数
window.showCredits = function() {
    if (appInstance && appInstance.creditsPage) {
        appInstance.creditsPage.show();
    }
};

//
window.startMusic = async function() {
    if (appInstance && appInstance.audioManager) {
        //
        appInstance.hideMusicStartOverlay();
        
        console.log('直接启动，不使用倒计时...');
        
        //
        const success = await appInstance.audioManager.autoPlaySchoolSong();
        
        //
        const audioControl = document.getElementById('audio-control');
        if (success) {
            console.log('校歌开始播放');
            if (audioControl) {
                audioControl.textContent = '🔊 校歌：播放中';
            }
        } else {
            console.log('校歌播放失败（浏览器限制）');
            if (audioControl) {
                audioControl.textContent = '🔇 校歌：等待播放';
            }
        }
        
        //
        appInstance.switchZone('welcome');
        
        //
        setTimeout(() => {
            if (appInstance.controls) {
                appInstance.controls.autoRotate = true;
                appInstance.controls.autoRotateSpeed = 0.2;
                console.log('自动旋转已启用（超慢速）');
            }
        }, 3000);
    }
};

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    appInstance = new YulinExhibition();
});

