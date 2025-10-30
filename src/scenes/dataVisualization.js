/**
 * 数据可视化场景
 */

import * as THREE from 'three';

export function createDataVisualization(scene) {
    const dataGroup = new THREE.Group();

    // 模拟数据 - 历年学生人数
    const studentData = [
        { year: 1985, count: 2000 },
        { year: 1995, count: 5000 },
        { year: 2005, count: 12000 },
        { year: 2015, count: 18000 },
        { year: 2025, count: 25000 }
    ];

    // 创建柱状图
    studentData.forEach((data, index) => {
        const height = data.count / 1000; // 缩放高度
        const barGeometry = new THREE.BoxGeometry(1.5, height, 1.5);
        
        // 渐变色
        const colors = [0x6bcf7f, 0x4ecdc4, 0x3da5d9, 0x6b5b95, 0xff6b6b];
        const barMaterial = new THREE.MeshStandardMaterial({
            color: colors[index],
            emissive: colors[index],
            emissiveIntensity: 0.3,
            metalness: 0.6,
            roughness: 0.3
        });

        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(index * 3 - 6, height / 2, 0);
        bar.castShadow = true;
        dataGroup.add(bar);

        // 添加光效
        const lightGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: colors[index],
            transparent: true,
            opacity: 0.7
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(index * 3 - 6, height + 0.1, 0);
        dataGroup.add(light);

        // 数据标签底座
        const labelBaseGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.1);
        const labelBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            transparent: true,
            opacity: 0.9
        });
        const labelBase = new THREE.Mesh(labelBaseGeometry, labelBaseMaterial);
        labelBase.position.set(index * 3 - 6, -0.8, 0);
        dataGroup.add(labelBase);
    });

    // 创建环形数据展示
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
        const radius = 3 + i * 0.5;
        const torusGeometry = new THREE.TorusGeometry(radius, 0.1, 16, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: 0x4ecdc4,
            emissive: 0x4ecdc4,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.3 + i * 0.1
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.x = Math.PI / 2;
        torus.position.y = 10 + i * 2;
        dataGroup.add(torus);
    }

    dataGroup.position.set(-25, 0, 0);
    scene.add(dataGroup);

    return dataGroup;
}

