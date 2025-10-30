import * as THREE from 'three';

/**
 * 图片透明度控制器 - 根据视角自动调整图片透明度，防止遮挡
 */
export class ImageTransparencyController {
    constructor(camera) {
        this.camera = camera;
        this.imageObjects = [];
    }

    /**
     * 添加需要控制的图片对象
     */
    addImage(imageFrame) {
        this.imageObjects.push(imageFrame);
    }

    /**
     * 批量添加图片对象
     */
    addImages(imageFrames) {
        this.imageObjects.push(...imageFrames);
    }

    /**
     * 更新所有图片的透明度（更保守的策略）
     */
    update() {
        const cameraPosition = this.camera.position.clone();

        this.imageObjects.forEach(frame => {
            // 获取图片位置
            const framePosition = new THREE.Vector3();
            frame.getWorldPosition(framePosition);

            // 计算相机到图片的向量
            const toCamera = cameraPosition.clone().sub(framePosition);

            // 获取图片的法线方向（正面朝向）
            const frameNormal = new THREE.Vector3(0, 0, 1);
            frameNormal.applyQuaternion(frame.quaternion);

            // 计算角度（点积）
            const dot = frameNormal.dot(toCamera.normalize());

            // 只有当相机非常靠近且在图片正后方时才调整透明度
            const distance = cameraPosition.distanceTo(framePosition);
            
            // 遍历frame的所有子对象（包括相框和照片）
            frame.traverse(child => {
                if (child.material) {
                    // 只有距离很近（<8米）且在背后（dot < -0.3）才降低透明度
                    if (distance < 8 && dot < -0.3) {
                        // 在背后且很近，降低透明度
                        const targetOpacity = 0.3;
                        
                        if (!child.material.transparent) {
                            child.material.transparent = true;
                            child.material.needsUpdate = true;
                        }
                        
                        child.material.opacity = targetOpacity;
                    } else {
                        // 其他情况保持不透明
                        if (child.material.opacity < 1) {
                            child.material.opacity = 1;
                        }
                    }
                }
            });
        });
    }

    /**
     * 清除所有对象
     */
    clear() {
        this.imageObjects = [];
    }
}

