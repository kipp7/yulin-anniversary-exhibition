/**
 * 历史时间轴场景
 */

import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export function createTimeline(scene) {
    // 时间轴数据
    const timelineData = [
        { year: 1945, event: '学校创建' },
        { year: 1958, event: '升格为师范专科' },
        { year: 1978, event: '改革开放新篇章' },
        { year: 2000, event: '升格为本科院校' },
        { year: 2015, event: '迈向高水平大学' },
        { year: 2025, event: '80周年校庆' }
    ];

    const timeline = new THREE.Group();
    
    // 创建时间轴主线
    const lineGeometry = new THREE.CylinderGeometry(0.05, 0.05, 30, 16);
    const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd93d,
        emissive: 0xffd93d,
        emissiveIntensity: 0.5,
        metalness: 0.8
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.z = Math.PI / 2;
    timeline.add(line);

    // 添加时间节点
    timelineData.forEach((data, index) => {
        const x = -12 + (index * 5);
        
        // 节点球体
        const nodeGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            emissive: 0xff6b6b,
            emissiveIntensity: 0.8,
            metalness: 0.9,
            roughness: 0.1
        });
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(x, 0, 0);
        timeline.add(node);

        // 创建文字面板（简化版）
        const panelGeometry = new THREE.PlaneGeometry(3, 1.5);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a4a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(x, index % 2 === 0 ? 2 : -2, 0);
        timeline.add(panel);

        // 连接线
        const connectGeometry = new THREE.CylinderGeometry(0.02, 0.02, Math.abs(panel.position.y), 8);
        const connectMaterial = new THREE.MeshBasicMaterial({ color: 0xffd93d });
        const connect = new THREE.Mesh(connectGeometry, connectMaterial);
        connect.position.set(x, panel.position.y / 2, 0);
        timeline.add(connect);

        // 添加光环效果
        const ringGeometry = new THREE.TorusGeometry(0.4, 0.02, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd93d,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(node.position);
        ring.rotation.x = Math.PI / 2;
        timeline.add(ring);
    });

    timeline.position.set(-15, 3, -15);
    scene.add(timeline);

    return timeline;
}

