/**
 * 致谢名单页面组件
 */

export class CreditsPage {
    constructor() {
        this.isVisible = false;
        this.createCreditsPage();
        this.bindEvents();
    }

    createCreditsPage() {
        // 创建致谢页面容器
        const creditsHTML = `
            <div id="credits-overlay" class="credits-overlay hidden">
                <div class="credits-container">
                    <button class="credits-close-button" onclick="window.closeCredits()">×</button>
                    
                    <div class="credits-content">
                        <div class="credits-header">
                            <h1 class="credits-title">致谢名单</h1>
                            <p class="credits-subtitle">感谢所有为本项目提供帮助和支持的个人与组织</p>
                        </div>

                        <div class="credits-section">
                            <h2 class="section-title">视频素材来源</h2>
                            <div class="credit-item">
                                <div class="credit-label">短视频平台创作者</div>
                                <div class="credit-value">抖音@原则、@路过你的时光</div>
                                <div class="credit-desc">感谢创作者分享的精彩校园生活记录视频</div>
                            </div>
                        </div>

                        <div class="credits-section">
                            <h2 class="section-title">图片素材来源</h2>
                            <div class="credit-item">
                                <div class="credit-label">校园摄影</div>
                                <div class="credit-value">玉林师范学院官方、学生摄影爱好者</div>
                                <div class="credit-desc">感谢提供的精美校园照片</div>
                            </div>
                        </div>

                        <div class="credits-section">
                            <h2 class="section-title">音频素材来源</h2>
                            <div class="credit-item">
                                <div class="credit-label">校歌</div>
                                <div class="credit-value">玉林师范学院官方校歌</div>
                                <div class="credit-desc">感谢学校提供的正式版校歌音频</div>
                            </div>
                        </div>

                        <div class="credits-section">
                            <h2 class="section-title">特别鸣谢</h2>
                            <div class="credit-item">
                                <div class="credit-label">玉林师范学院</div>
                                <div class="credit-value">八秩芳华，桃李满天下</div>
                                <div class="credit-desc">感谢母校80年来的培育与关怀</div>
                            </div>
                            <div class="credit-item">
                                <div class="credit-label">全体师生校友</div>
                                <div class="credit-value">共同见证学校发展</div>
                                <div class="credit-desc">感谢每一位为学校建设贡献力量的人</div>
                            </div>
                        </div>

                        <div class="credits-footer">
                            <p>制作时间：2025年10月</p>
                            <p>献礼玉林师范学院80周年校庆</p>
                            <p class="credits-hint">按 ESC 或点击关闭按钮退出</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', creditsHTML);
    }

    bindEvents() {
        // 按键事件：F1 或 C 键显示致谢
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                this.show();
            } else if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // 全局关闭函数
        window.closeCredits = () => {
            this.hide();
        };
    }

    show() {
        const overlay = document.getElementById('credits-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.isVisible = true;
            console.log('📜 致谢名单已显示');
        }
    }

    hide() {
        const overlay = document.getElementById('credits-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            this.isVisible = false;
            console.log('📜 致谢名单已关闭');
        }
    }
}

