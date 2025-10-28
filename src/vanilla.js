/**
 * GuideMeFast - Vanilla JavaScript Implementation
 * Beautiful, lightweight library for creating interactive guided tours
 */

// Default translations
const defaultTranslations = {
    en: {
        next: 'Next',
        previous: 'Previous',
        skip: 'Skip Tour',
        finish: 'Finish',
        close: 'Close',
        loading: 'Loading...',
        stepCounter: '{current} of {total}',
        progressAriaLabel: 'Tour progress: step {current} of {total}',
        closeAriaLabel: 'Close tour',
        tooltipAriaLabel: 'Tour step {current}: {title}',
        highlightAriaLabel: 'Highlighted element for tour step {current}',
        aiSuggestionLoading: 'AI is personalizing content...',
        aiSuggestionError: 'Unable to personalize content',
        aiPersonalizeButton: 'Personalize with AI',
        aiOptimizeButton: 'Optimize Tour'
    }
};

class GuideMeFast {
    constructor(config) {
        this.config = {
            theme: 'light',
            showProgress: true,
            showStepNumbers: true,
            backdropOpacity: 0.7,
            highlightPadding: 8,
            scrollBehavior: 'smooth',
            zIndex: 9999,
            closeOnEscape: true,
            closeOnClickOutside: false,
            locale: 'en',
            keyboard: { enabled: true },
            ai: { enabled: false },
            customStyles: {},
            customTexts: {},
            translations: {},
            ...config,
        };

        this.currentStep = 0;
        this.isActive = false;
        this.elements = {};
        this.loading = false;
        this.rafId = null;
        this.userContext = {};

        // Get translations
        this.translations = this.getTranslations();

        // Initialize AI service if enabled
        if (this.config.ai && this.config.ai.enabled) {
            this.aiService = this.createAIService(this.config.ai);
        }

        // Initialize keyboard service if enabled
        if (this.config.keyboard && this.config.keyboard.enabled) {
            this.keyboardService = this.createKeyboardService(this.config.keyboard);
        }

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.updatePositions = this.updatePositions.bind(this);
    }

    getTranslations() {
        const locale = this.config.locale || 'en';
        const baseTranslations = defaultTranslations[locale] || defaultTranslations.en;

        if (this.config.translations && this.config.translations[locale]) {
            return { ...baseTranslations, ...this.config.translations[locale] };
        }

        return baseTranslations;
    }

    getText(key, stepCustomTexts) {
        if (stepCustomTexts && stepCustomTexts[key]) {
            return stepCustomTexts[key];
        }

        if (this.config.customTexts && this.config.customTexts[key]) {
            return this.config.customTexts[key];
        }

        return this.translations[key] || key;
    }

    formatText(template, values) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values[key] !== undefined ? String(values[key]) : match;
        });
    }

    createAIService(aiConfig) {
        return {
            enabled: aiConfig.enabled,
            config: aiConfig,

            async personalizeStep(step, userContext) {
                if (!this.enabled || !this.config.features?.personalizeContent) {
                    return {};
                }

                try {
                    const prompt = this.buildPersonalizationPrompt(step, userContext);
                    const response = await this.makeAIRequest(prompt, { step, userContext });
                    return this.parseResponse(response);
                } catch (error) {
                    console.warn('AI personalization failed:', error);
                    return {};
                }
            },

            buildPersonalizationPrompt(step, userContext) {
                return `Personalize this tour step for the user:
                
Current Step:
- Title: ${step.title}
- Content: ${step.content}
- Target: ${step.target}

User Context:
- Role: ${userContext.role || 'unknown'}
- Experience: ${userContext.experience || 'beginner'}

Return JSON with 'title' and 'content' fields.`;
            },

            async makeAIRequest(prompt, context) {
                if (this.config.onAIRequest) {
                    return await this.config.onAIRequest(prompt, context);
                }

                if (this.config.customEndpoint) {
                    const response = await fetch(this.config.customEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (this.config.apiKey || '')
                        },
                        body: JSON.stringify({ prompt, context })
                    });

                    const data = await response.json();
                    return data.response || data.content || '';
                }

                throw new Error('No AI request handler configured');
            },

            parseResponse(response) {
                try {
                    return JSON.parse(response);
                } catch (error) {
                    console.warn('Failed to parse AI response');
                    return {};
                }
            }
        };
    }

    createKeyboardService(keyboardConfig) {
        const self = this;

        return {
            enabled: keyboardConfig.enabled,
            config: keyboardConfig,
            boundHandler: null,

            attach() {
                if (!this.enabled) return;

                this.boundHandler = this.handleKeyDown.bind(this);
                document.addEventListener('keydown', this.boundHandler, true);
            },

            detach() {
                if (this.boundHandler) {
                    document.removeEventListener('keydown', this.boundHandler, true);
                }
            },

            handleKeyDown(event) {
                if (!self.isActive) return;

                const shortcuts = this.config.shortcuts || this.getDefaultShortcuts();
                const key = this.getKeyString(event);
                let handled = false;

                if (shortcuts.next && shortcuts.next.includes(key)) {
                    self.next();
                    handled = true;
                } else if (shortcuts.previous && shortcuts.previous.includes(key)) {
                    self.prev();
                    handled = true;
                } else if (shortcuts.skip && shortcuts.skip.includes(key)) {
                    self.handleSkip();
                    handled = true;
                } else if (shortcuts.close && shortcuts.close.includes(key)) {
                    self.handleClose();
                    handled = true;
                } else if (shortcuts.finish && shortcuts.finish.includes(key)) {
                    if (self.currentStep === self.config.steps.length - 1) {
                        self.handleNext();
                        handled = true;
                    }
                }

                if (handled && this.config.preventDefaults) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            },

            getKeyString(event) {
                const parts = [];

                if (event.ctrlKey) parts.push('ctrl');
                if (event.altKey) parts.push('alt');
                if (event.shiftKey) parts.push('shift');
                if (event.metaKey) parts.push('meta');

                parts.push(event.key.toLowerCase());

                return parts.join('+');
            },

            getDefaultShortcuts() {
                return {
                    next: ['arrowright', 'space', 'enter'],
                    previous: ['arrowleft', 'backspace'],
                    skip: ['ctrl+s', 'alt+s'],
                    close: ['escape', 'ctrl+c'],
                    finish: ['ctrl+enter', 'alt+enter']
                };
            }
        };
    }

    async start() {
        if (this.isActive || !this.config.steps || !this.config.steps.length) {
            return;
        }

        this.isActive = true;
        this.currentStep = 0;

        this.createElements();
        await this.updateStep();
        this.attachEventListeners();
    }

    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        this.removeEventListeners();
        this.removeElements();
        this.currentStep = 0;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    async next() {
        if (this.currentStep < this.config.steps.length - 1) {
            await this.handleNext();
        }
    }

    async prev() {
        if (this.currentStep > 0) {
            await this.handlePrev();
        }
    }

    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
            this.currentStep = stepIndex;
            this.updateStep();
        }
    }

    async personalizeCurrentStep() {
        if (!this.aiService) return;

        const step = this.config.steps[this.currentStep];
        if (!step || !step.aiContext || !step.aiContext.personalizable) return;

        try {
            this.setLoading(true, this.getText('aiSuggestionLoading'));

            const personalizedStep = await this.aiService.personalizeStep(step, this.userContext);
            Object.assign(step, personalizedStep);

            this.updateTooltipContent(step);
        } catch (error) {
            console.error('Personalization failed:', error);
            const originalContent = this.elements.body.innerHTML;
            this.elements.body.innerHTML = this.getText('aiSuggestionError');

            setTimeout(() => {
                this.elements.body.innerHTML = originalContent;
            }, 2000);
        } finally {
            this.setLoading(false);
        }
    }

    setUserContext(context) {
        this.userContext = Object.assign({}, this.userContext, context);
    }

    createElements() {
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'guidemefast-overlay guidemefast-theme-' + this.config.theme;
        this.elements.overlay.setAttribute('role', 'dialog');
        this.elements.overlay.setAttribute('aria-modal', 'true');

        this.elements.backdrop = document.createElement('div');
        this.elements.backdrop.className = 'guidemefast-backdrop';
        this.elements.backdrop.style.cssText =
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100%;' +
            'height: 100%;' +
            'z-index: ' + this.config.zIndex + ';' +
            'opacity: ' + this.config.backdropOpacity + ';';

        Object.assign(this.elements.backdrop.style, this.config.customStyles.backdrop || {});

        if (this.config.closeOnClickOutside) {
            this.elements.backdrop.addEventListener('click', this.handleClose);
        }

        this.elements.highlight = document.createElement('div');
        this.elements.highlight.className = 'guidemefast-highlight';
        this.elements.highlight.style.cssText =
            'position: fixed;' +
            'z-index: ' + (this.config.zIndex + 1) + ';' +
            'pointer-events: none;';

        Object.assign(this.elements.highlight.style, this.config.customStyles.highlight || {});

        this.elements.tooltip = document.createElement('div');
        this.elements.tooltip.className = 'guidemefast-tooltip';
        this.elements.tooltip.style.cssText =
            'position: fixed;' +
            'z-index: ' + (this.config.zIndex + 2) + ';';

        Object.assign(this.elements.tooltip.style, this.config.customStyles.tooltip || {});

        // Create tooltip content
        this.createTooltipContent();

        // Append to overlay
        this.elements.overlay.appendChild(this.elements.backdrop);
        this.elements.overlay.appendChild(this.elements.highlight);
        this.elements.overlay.appendChild(this.elements.tooltip);

        // Append to body
        document.body.appendChild(this.elements.overlay);
    }

    createTooltipContent() {
        this.elements.tooltip.innerHTML =
            '<button class="guidemefast-close" aria-label="' + this.getText('closeAriaLabel') + '">×</button>' +

            (this.config.showProgress ?
                '<div class="guidemefast-progress">' +
                '<div class="guidemefast-progress-bar"></div>' +
                '</div>' : '') +

            (this.config.showStepNumbers ?
                '<div class="guidemefast-step-counter"></div>' : '') +

            '<div class="guidemefast-content">' +
            '<h3 class="guidemefast-title"></h3>' +
            '<div class="guidemefast-body"></div>' +
            '</div>' +

            '<div class="guidemefast-navigation">' +
            '<button class="guidemefast-btn guidemefast-btn-ghost guidemefast-skip">' + this.getText('skip') + '</button>' +
            '<button class="guidemefast-btn guidemefast-btn-secondary guidemefast-prev">' + this.getText('previous') + '</button>' +
            '<button class="guidemefast-btn guidemefast-btn-primary guidemefast-next">' + this.getText('next') + '</button>' +
            '</div>' +

            '<div class="guidemefast-arrow"></div>';

        this.elements.closeBtn = this.elements.tooltip.querySelector('.guidemefast-close');
        this.elements.skipBtn = this.elements.tooltip.querySelector('.guidemefast-skip');
        this.elements.prevBtn = this.elements.tooltip.querySelector('.guidemefast-prev');
        this.elements.nextBtn = this.elements.tooltip.querySelector('.guidemefast-next');
        this.elements.progressBar = this.elements.tooltip.querySelector('.guidemefast-progress-bar');
        this.elements.stepCounter = this.elements.tooltip.querySelector('.guidemefast-step-counter');
        this.elements.title = this.elements.tooltip.querySelector('.guidemefast-title');
        this.elements.body = this.elements.tooltip.querySelector('.guidemefast-body');
        this.elements.arrow = this.elements.tooltip.querySelector('.guidemefast-arrow');

        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', this.handleClose);
        }
        if (this.elements.skipBtn) {
            this.elements.skipBtn.addEventListener('click', this.handleSkip);
        }
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', this.handlePrev);
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', this.handleNext);
        }
    }

    async updateStep() {
        const step = this.config.steps[this.currentStep];
        if (!step) return;

        if (this.aiService && step.aiContext && step.aiContext.personalizable) {
            try {
                const personalizedStep = await this.aiService.personalizeStep(step, this.userContext);
                Object.assign(step, personalizedStep);
            } catch (error) {
                console.warn('Auto-personalization failed, using original content');
            }
        }

        this.updateTooltipContent(step);

        // Then update positions
        this.updatePositions();

        // Scroll to element if needed
        this.scrollToElement(step.target);
    }

    // FIXED: More efficient position update with requestAnimationFrame
    updatePositions() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
            const step = this.config.steps[this.currentStep];
            if (!step) return;

            this.updateHighlight(step.target);
            this.updateTooltip(step);
        });
    }

    // FIXED: Use getBoundingClientRect for viewport-relative positioning
    updateHighlight(target) {
        const element = document.querySelector(target);
        if (!element) {
            this.elements.highlight.style.display = 'none';
            return;
        }

        const rect = element.getBoundingClientRect();
        const padding = this.config.highlightPadding;

        this.elements.highlight.style.display = 'block';
        this.elements.highlight.style.position = 'fixed';
        this.elements.highlight.style.top = (rect.top - padding) + 'px';
        this.elements.highlight.style.left = (rect.left - padding) + 'px';
        this.elements.highlight.style.width = (rect.width + padding * 2) + 'px';
        this.elements.highlight.style.height = (rect.height + padding * 2) + 'px';
    }

    updateTooltip(step) {
        const target = document.querySelector(step.target);
        if (!target) return;

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.elements.tooltip.getBoundingClientRect();

        const position = this.calculateTooltipPosition(
            {
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
            },
            step.placement || 'top',
            {
                width: tooltipRect.width || 320,
                height: tooltipRect.height || 200,
            },
            step.offset || { x: 0, y: 0 }
        );

        this.elements.tooltip.style.top = position.top + 'px';
        this.elements.tooltip.style.left = position.left + 'px';
    }

    calculateTooltipPosition(targetPos, placement, tooltipSize, offset) {
        const gap = 12;
        let top = 0;
        let left = 0;

        switch (placement) {
            case 'top':
                top = targetPos.top - tooltipSize.height - gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'bottom':
                top = targetPos.top + targetPos.height + gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
                break;
            case 'left':
                top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPos.left - tooltipSize.width - gap + offset.x;
                break;
            case 'right':
                top = targetPos.top + (targetPos.height / 2) - (tooltipSize.height / 2) + offset.y;
                left = targetPos.left + targetPos.width + gap + offset.x;
                break;
            default:
                top = targetPos.top - tooltipSize.height - gap + offset.y;
                left = targetPos.left + (targetPos.width / 2) - (tooltipSize.width / 2) + offset.x;
        }

        // Keep tooltip within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipSize.width > viewportWidth - 10) {
            left = viewportWidth - tooltipSize.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipSize.height > viewportHeight - 10) {
            top = viewportHeight - tooltipSize.height - 10;
        }

        return { top: top, left: left };
    }

    scrollToElement(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: this.config.scrollBehavior,
                block: 'center',
                inline: 'nearest',
            });
        }
    }

    updateTooltipContent(step) {
        const stepCustomTexts = step.customTexts;

        if (this.elements.title) {
            const title = typeof step.title === 'function' ? step.title(this.translations) : step.title;
            this.elements.title.textContent = title || '';
            this.elements.title.style.display = title ? 'block' : 'none';
        }

        if (this.elements.body) {
            const content = typeof step.content === 'function' ? step.content(this.translations) : step.content;
            this.elements.body.innerHTML = content || '';
        }

        if (this.elements.stepCounter && this.config.showStepNumbers) {
            const counterText = this.formatText(
                this.getText('stepCounter'),
                { current: this.currentStep + 1, total: this.config.steps.length }
            );
            this.elements.stepCounter.textContent = counterText;
        }

        if (this.elements.progressBar && this.config.showProgress) {
            const progress = ((this.currentStep + 1) / this.config.steps.length) * 100;
            this.elements.progressBar.style.width = progress + '%';

            const progressLabel = this.formatText(
                this.getText('progressAriaLabel'),
                { current: this.currentStep + 1, total: this.config.steps.length }
            );
            this.elements.progressBar.setAttribute('aria-label', progressLabel);
        }

        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        if (this.elements.prevBtn) {
            this.elements.prevBtn.textContent = this.getText('previous', stepCustomTexts);
            this.elements.prevBtn.style.display = (isFirstStep || step.showPrev === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.skipBtn) {
            this.elements.skipBtn.textContent = this.getText('skip', stepCustomTexts);
            this.elements.skipBtn.style.display = (isLastStep || step.showSkip === false) ? 'none' : 'inline-flex';
        }

        if (this.elements.nextBtn) {
            this.elements.nextBtn.textContent = isLastStep ? this.getText('finish', stepCustomTexts) : this.getText('next', stepCustomTexts);
            this.elements.nextBtn.style.display = step.showNext === false ? 'none' : 'inline-flex';
        }

        if (this.elements.closeBtn) {
            this.elements.closeBtn.setAttribute('aria-label', this.getText('closeAriaLabel'));
        }

        if (this.elements.tooltip) {
            const tooltipLabel = this.formatText(
                this.getText('tooltipAriaLabel'),
                { current: this.currentStep + 1, title: step.title }
            );
            this.elements.tooltip.setAttribute('aria-label', tooltipLabel);
        }

        this.addAIFeatures(step);

        if (step.customClass) {
            this.elements.tooltip.className = 'guidemefast-tooltip ' + step.customClass;
        }

        if (this.elements.arrow) {
            const placement = step.placement || 'top';
            this.elements.arrow.className = 'guidemefast-arrow guidemefast-arrow-' + placement;
        }
    }

    addAIFeatures(step) {
        if (!this.aiService || !step.aiContext || !step.aiContext.personalizable) return;

        let aiButton = this.elements.tooltip.querySelector('.guidemefast-ai-personalize');

        if (!aiButton) {
            aiButton = document.createElement('button');
            aiButton.className = 'guidemefast-btn guidemefast-btn-ghost guidemefast-ai-personalize';
            aiButton.innerHTML = '🤖 ' + this.getText('aiPersonalizeButton');
            aiButton.addEventListener('click', () => this.personalizeCurrentStep());

            const navigation = this.elements.tooltip.querySelector('.guidemefast-navigation');
            if (navigation && navigation.parentNode) {
                navigation.parentNode.insertBefore(aiButton, navigation);
            }
        }
    }

    setLoading(loading, customText) {
        this.loading = loading;

        const buttons = [this.elements.nextBtn, this.elements.prevBtn, this.elements.skipBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = loading;
                if (btn === this.elements.nextBtn) {
                    if (loading) {
                        btn.dataset.originalText = btn.textContent;
                        btn.textContent = customText || this.getText('loading');
                    } else if (btn.dataset.originalText) {
                        btn.textContent = btn.dataset.originalText;
                        delete btn.dataset.originalText;
                    }
                }
            }
        });
    }

    async handleNext() {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];
        const isLastStep = this.currentStep === this.config.steps.length - 1;

        this.setLoading(true);

        try {
            if (step && step.onNext) {
                await step.onNext();
            }

            if (isLastStep) {
                if (this.config.onComplete) {
                    this.config.onComplete();
                }
                this.stop();
            } else {
                this.currentStep++;
                await this.updateStep();
            }
        } catch (error) {
            console.error('Error in onNext:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async handlePrev() {
        if (this.loading || this.currentStep === 0) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step && step.onPrev) {
                await step.onPrev();
            }

            this.currentStep--;
            await this.updateStep();
        } catch (error) {
            console.error('Error in onPrev:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async handleSkip() {
        if (this.loading) return;

        const step = this.config.steps[this.currentStep];

        this.setLoading(true);

        try {
            if (step && step.onSkip) {
                await step.onSkip();
            } else if (this.config.onSkip) {
                await this.config.onSkip();
            }
        } catch (error) {
            console.error('Error in onSkip:', error);
        } finally {
            this.setLoading(false);
            this.stop();
        }
    }

    handleClose() {
        this.stop();
    }

    handleKeyDown(e) {
        if (this.config.closeOnEscape && e.key === 'Escape') {
            this.handleClose();
        }
    }

    handleResize() {
        if (!this.isActive) return;
        this.updatePositions();
    }

    handleScroll() {
        if (!this.isActive) return;
        this.updatePositions();
    }

    attachEventListeners() {
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        if (this.keyboardService) {
            this.keyboardService.attach();
        }

        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);

        if (this.keyboardService) {
            this.keyboardService.detach();
        }

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
    }

    removeElements() {
        if (this.elements.overlay && this.elements.overlay.parentNode) {
            this.elements.overlay.parentNode.removeChild(this.elements.overlay);
        }
        this.elements = {};
    }

    getCurrentStep() {
        return this.config.steps[this.currentStep];
    }

    getProgress() {
        return Math.round(((this.currentStep + 1) / this.config.steps.length) * 100);
    }

    addStep(step, index) {
        if (index === null || index === undefined) {
            this.config.steps.push(step);
        } else {
            this.config.steps.splice(index, 0, step);
        }
    }

    removeStep(index) {
        if (index >= 0 && index < this.config.steps.length) {
            this.config.steps.splice(index, 1);

            if (this.currentStep >= index && this.currentStep > 0) {
                this.currentStep--;
            }

            if (this.isActive) {
                this.updateStep();
            }
        }
    }

    updateConfig(newConfig) {
        this.config = Object.assign({}, this.config, newConfig);

        if (newConfig.locale || newConfig.translations) {
            this.translations = this.getTranslations();
        }

        if (newConfig.ai) {
            if (newConfig.ai.enabled && !this.aiService) {
                this.aiService = this.createAIService(newConfig.ai);
            } else if (!newConfig.ai.enabled) {
                this.aiService = null;
            }
        }

        if (newConfig.keyboard) {
            if (newConfig.keyboard.enabled && !this.keyboardService) {
                this.keyboardService = this.createKeyboardService(newConfig.keyboard);
                if (this.isActive) {
                    this.keyboardService.attach();
                }
            } else if (!newConfig.keyboard.enabled && this.keyboardService) {
                this.keyboardService.detach();
                this.keyboardService = null;
            }
        }

        if (this.isActive && this.elements.overlay) {
            this.elements.overlay.className = `guidemefast-overlay guidemefast-theme-${this.config.theme}`;
        }
    }
}

// Global API for CDN usage
if (typeof window !== 'undefined') {
    window.GuideMeFast = GuideMeFast;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuideMeFast;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], () => {
        return GuideMeFast;
    });
}
