import * as THREE from 'three';
import gsap from 'gsap';

/**
 * 内容卡片展示组件 - 在3D场景中显示详细的展区信息
 */
export class ContentCardDisplay {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.cardMesh = null;
        this.isShowing = false;
    }

    /**
     * 显示展区内容卡片
     */
    show(zoneName, content) {
        this.hide(); // 先清除之前的

        console.log(`📋 显示展区内容卡片: ${zoneName}`);
        
        // 创建内容卡片
        this.createContentCard(zoneName, content);
        
        this.isShowing = true;
    }

    /**
     * 创建内容卡片
     */
    createContentCard(zoneName, content) {
        // 创建Canvas绘制内容
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2600;
        const ctx = canvas.getContext('2d');

        // 背景 - 半透明深色
        const gradient = ctx.createLinearGradient(0, 0, 0, 2600);
        gradient.addColorStop(0, 'rgba(42, 42, 74, 0.95)');
        gradient.addColorStop(1, 'rgba(26, 26, 52, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 2600);

        // 装饰边框
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 15;
        ctx.strokeRect(30, 30, 1988, 2540);

        // 内边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 5;
        ctx.strokeRect(60, 60, 1928, 2480);

        // 绘制标题
        ctx.font = 'Bold 120px Arial';
        ctx.fillStyle = '#ff6b6b';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText(zoneName, 1024, 200);

        // 解析并渲染内容
        this.renderContent(ctx, content);

        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // 创建3D卡片
        const geometry = new THREE.PlaneGeometry(24, 30);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        this.cardMesh = new THREE.Mesh(geometry, material);

        // 放置在相机前方
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        const position = new THREE.Vector3();
        position.copy(this.camera.position);
        position.add(cameraDirection.multiplyScalar(28));
        position.y = this.camera.position.y;

        this.cardMesh.position.copy(position);
        this.cardMesh.lookAt(this.camera.position);

        this.scene.add(this.cardMesh);

        // 淡入动画
        gsap.to(material, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out'
        });

        // 缩放动画
        this.cardMesh.scale.set(0.3, 0.3, 0.3);
        gsap.to(this.cardMesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.8,
            ease: 'back.out(1.5)'
        });

        // 添加关闭按钮提示
        this.addCloseButton();
    }

    /**
     * 渲染内容到Canvas
     */
    renderContent(ctx, content) {
        let y = 280;
        
        // 移除HTML标签，保留纯文本
        const cleanContent = content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ');

        // 按行分割
        const lines = cleanContent.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 跳过空行（但保留一点间距）
            if (!trimmedLine) {
                y += 25;
                continue;
            }

            // 检测emoji标题（如🌅、🌱等）
            if (trimmedLine.match(/^[🌅🌱🚀✨📖🏢🎓🎵📊🎬💝]/)) {
                ctx.font = 'Bold 80px "Microsoft YaHei", Arial';
                ctx.fillStyle = '#ffd93d';
                ctx.textAlign = 'left';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                
                const wrappedLines = this.wrapText(ctx, trimmedLine, 1850);
                wrappedLines.forEach(t => {
                    ctx.fillText(t, 120, y);
                    y += 95;
                });
                y += 20; // 标题后额外间距
            }
            // 检测年份行
            else if (trimmedLine.match(/^\d{4}/)) {
                ctx.font = 'Bold 65px "Microsoft YaHei", Arial';
                ctx.fillStyle = '#95e1d3';
                ctx.textAlign = 'left';
                ctx.shadowBlur = 8;
                
                const wrappedLines = this.wrapText(ctx, trimmedLine, 1750);
                wrappedLines.forEach(t => {
                    ctx.fillText(t, 160, y);
                    y += 80;
                });
            }
            // 检测分隔符
            else if (trimmedLine.includes('|')) {
                ctx.font = '55px "Microsoft YaHei", Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 5;
                
                const parts = trimmedLine.split('|');
                parts.forEach(part => {
                    ctx.fillText(part.trim(), 1024, y);
                    y += 70;
                });
            }
            // 普通文本
            else {
                ctx.font = '58px "Microsoft YaHei", Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.textAlign = 'left';
                ctx.shadowBlur = 5;
                
                const wrappedLines = this.wrapText(ctx, trimmedLine, 1750);
                wrappedLines.forEach(t => {
                    ctx.fillText(t, 160, y);
                    y += 72;
                });
            }
        }
    }

    /**
     * 文字换行处理
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';

        for (const char of words) {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * 添加关闭按钮
     */
    addCloseButton() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
        ctx.fillRect(0, 0, 512, 128);

        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.strokeRect(5, 5, 502, 118);

        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✕ 点击任意处关闭', 256, 85);

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(6, 1.5);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const button = new THREE.Mesh(geometry, material);
        button.position.set(0, -16, 0.1);
        button.userData.isCloseButton = true;
        
        this.cardMesh.add(button);
    }

    /**
     * 隐藏卡片
     */
    hide() {
        if (this.cardMesh) {
            gsap.to(this.cardMesh.material, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.scene.remove(this.cardMesh);
                    if (this.cardMesh.geometry) this.cardMesh.geometry.dispose();
                    if (this.cardMesh.material) {
                        if (this.cardMesh.material.map) this.cardMesh.material.map.dispose();
                        this.cardMesh.material.dispose();
                    }
                    this.cardMesh = null;
                }
            });
        }

        this.isShowing = false;
    }

    /**
     * 检查点击
     */
    handleClick(object) {
        if (!this.isShowing) return false;

        // 点击卡片任意位置或关闭按钮都关闭
        let current = object;
        while (current) {
            if (current === this.cardMesh || current.userData.isCloseButton) {
                this.hide();
                return true;
            }
            current = current.parent;
        }

        return false;
    }
}

