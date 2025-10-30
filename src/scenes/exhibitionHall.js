/**
 * 展览大厅场景创建
 */

import * as THREE from 'three';

export function createExhibitionHall(scene) {
    // 创建展厅墙壁（圆形布局）
    const wallSegments = 12;
    const radius = 40;
    const wallHeight = 10;

    for (let i = 0; i < wallSegments; i++) {
        const angle = (i / wallSegments) * Math.PI * 2;
        const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(nextAngle) * radius;
        const z2 = Math.sin(nextAngle) * radius;

        const wallWidth = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

        const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, 0.5);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xc8102e,  // 中国红（党政标准红）
            metalness: 0.2,
            roughness: 0.6,
            emissive: 0xff0000,  // 红色发光
            emissiveIntensity: 0.15,
            side: THREE.DoubleSide
        });

        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(
            (x1 + x2) / 2,
            wallHeight / 2,
            (z1 + z2) / 2
        );
        wall.rotation.y = angle + Math.PI / 2;
        wall.castShadow = true;
        wall.receiveShadow = true;

        scene.add(wall);

        // 添加装饰线条（金色边框 - 党政风格）
        const lineGeometry = new THREE.BoxGeometry(wallWidth, 0.3, 0.7);
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,  // 金色（党政标准金）
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });

        const topLine = new THREE.Mesh(lineGeometry, lineMaterial);
        topLine.position.copy(wall.position);
        topLine.position.y = wallHeight - 0.5;
        topLine.rotation.y = wall.rotation.y;
        scene.add(topLine);

        const bottomLine = new THREE.Mesh(lineGeometry, lineMaterial);
        bottomLine.position.copy(wall.position);
        bottomLine.position.y = 0.5;
        bottomLine.rotation.y = wall.rotation.y;
        scene.add(bottomLine);
    }

    // 创建党政风格天花板（暖金色）
    const ceilingGeometry = new THREE.CircleGeometry(radius, 64);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffeaa7,  // 暖金色天花板
        side: THREE.DoubleSide,
        metalness: 0.4,
        roughness: 0.5,
        emissive: 0xffd700,  // 金色发光
        emissiveIntensity: 0.2
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);

    // 添加摄影棚灯光阵列（环形分布）
    const spotlightCount = 12;
    for (let i = 0; i < spotlightCount; i++) {
        const angle = (i / spotlightCount) * Math.PI * 2;
        const spotRadius = radius * 0.7;
        
        // 聚光灯
        const spotlight = new THREE.SpotLight(0xffffff, 1.5);
        spotlight.position.set(
            Math.cos(angle) * spotRadius,
            wallHeight - 0.5,
            Math.sin(angle) * spotRadius
        );
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.3;
        spotlight.decay = 2;
        spotlight.distance = 25;
        spotlight.castShadow = true;
        
        // 指向地面
        spotlight.target.position.set(
            Math.cos(angle) * spotRadius * 0.3,
            0,
            Math.sin(angle) * spotRadius * 0.3
        );
        
        scene.add(spotlight);
        scene.add(spotlight.target);
        
        // 灯具外壳（金色金属 - 党政风格）
        const lampGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 16);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,  // 金色
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.copy(spotlight.position);
        lamp.position.y -= 0.3;
        scene.add(lamp);
        
        // 灯光指示（发光圆圈）
        const indicatorGeometry = new THREE.CircleGeometry(0.2, 16);
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.copy(lamp.position);
        indicator.position.y -= 0.26;
        indicator.rotation.x = -Math.PI / 2;
        scene.add(indicator);
    }

    // 添加装饰柱子
    const columns = 8;
    for (let i = 0; i < columns; i++) {
        const angle = (i / columns) * Math.PI * 2;
        const colRadius = 30;
        
        const columnGeometry = new THREE.CylinderGeometry(0.6, 0.8, wallHeight, 12);
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,  // 暗红色柱子（党政风格）
            metalness: 0.3,
            roughness: 0.6,
            emissive: 0xff0000,
            emissiveIntensity: 0.1
        });

        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(
            Math.cos(angle) * colRadius,
            wallHeight / 2,
            Math.sin(angle) * colRadius
        );
        column.castShadow = true;
        scene.add(column);

        // 柱子顶部装饰（金色 - 党政风格）
        const capGeometry = new THREE.CylinderGeometry(1, 0.6, 0.5, 12);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,  // 金色
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.copy(column.position);
        cap.position.y = wallHeight - 0.25;
        scene.add(cap);
    }

    return { radius, wallHeight };
}

