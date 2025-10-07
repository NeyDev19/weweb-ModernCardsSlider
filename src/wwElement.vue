<template>
    <div
        class="element-container"
        :style="cssVariables"
        :class="{ editing: isEditing, selected: isSelected }"
        @mouseenter="content.autoplay && content.pauseOnHover && stopAutoplay()"
        @mouseleave="content.autoplay && content.pauseOnHover && startAutoplay()"
    >
        <div class="card-carousel-wrapper" :style="{ height: content.height }">
            <div 
                class="card-carousel-slides" 
                :class="{ 'is-vertical': content.direction === 'vertical' }"
                @mousedown="handleDragStart"
                @touchstart="handleDragStart"
            >
                <wwLayout
                    path="mainLayoutContent"
                    class="slides-layout"
                    style="width: 100%; height: 100%;"
                    :disable-drag-drop="true"
                >
                    <template #default="{ item, index }">
                        <wwLayoutItem
                            v-if="item !== undefined"
                            :key="item.uid"
                            class="card-carousel-slide"
                            :style="getSlideStyles(index)"
                        >
                            <wwElement
                                class="slide-content"
                                v-bind="item"
                                :states="index !== sliderIndex ? ['Not Current Slide'] : []"
                            />
                        </wwLayoutItem>
                    </template>
                </wwLayout>
            </div>
        </div>

        <div v-show="content.pagination && nbOfSlides > 0" class="bullets">
            <div
                v-for="index in nbOfSlides"
                :key="index"
                class="bullet-container"
                @click="slideTo(index - 1)"
            >
                <wwLocalContext
                    :data="{ currentBulletIndex: index, isCurrent: index - 1 === sliderIndex }"
                    elementKey="bullet"
                >
                    <wwElement
                        class="bulletIcon"
                        v-bind="content.bulletsIcons"
                        :states="index - 1 === sliderIndex ? ['active', 'Current Slide'] : []"
                    />
                </wwLocalContext>
            </div>
        </div>

        <div v-show="showLeftNav" class="navigation-container prev" @click="slidePrev">
            <wwElement class="layout-prev" v-bind="content.navigationIcons[0]" />
        </div>
        <div v-show="showRightNav" class="navigation-container next" @click="slideNext">
            <wwElement class="layout-next" v-bind="content.navigationIcons[1]" />
        </div>

        
        <div class="element-container__status label-xs">Slide {{ sliderIndex + 1 }}</div>
        
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

import { getContent } from './getContent.js';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        wwFrontState: { type: Object, required: true },
        
        wwEditorState: { type: Object, required: true },
        
    },
    emits: ['update:content', 'update:sidepanel-content'],
    setup(props, { emit }) {
        
        const { createElement, cloneElement } = wwLib.useCreateElement();
        

        const sliderIndex = ref(0);
        let autoplayIntervalId = null;
        
        
        const dragState = ref({
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            dragOffset: 0,
        });

        const isEditing = computed(() => {
            
            return props.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            
            
            return false;
        });

        const isSelected = computed(() => {
            
            return props.wwEditorState.isSelected;
            
            
            return false;
        });

        const nbOfSlides = computed(() => {
            const content = getContent(props.content.mainLayoutContent);
            return content.length;
        });

        const transitionDurationCss = computed(() => {
            
            let value = props.content.transitionDuration || '500ms';
            return parseFloat(value) + 'ms';
        });
        const transitionDurationMs = computed(() => {
            
            let value = props.content.transitionDuration || '500ms';
            return parseFloat(value);
        });

        const autoplayIntervalMs = computed(() => {
            let value = props.content.autoplayInterval || '3000ms';
            return parseFloat(value);
        });

        const showLeftNav = computed(() => {
            if (!props.content.navigation) return false;
            if (nbOfSlides.value <= 1) return false;
            if (props.content.loop) return true;
            return sliderIndex.value > 0;
        });

        const showRightNav = computed(() => {
            if (!props.content.navigation) return false;
            if (nbOfSlides.value <= 1) return false;
            if (props.content.loop) return true;
            return sliderIndex.value < nbOfSlides.value - 1;
        });

        const cssVariables = computed(() => {
            return {
                '--transition-duration': transitionDurationCss.value,
            };
        });

        const getSlideStyles = index => {
            const styles = {};
            const total = nbOfSlides.value;
            const isVertical = props.content.direction === 'vertical';

            let diff = index - sliderIndex.value;

            
            if (props.content.loop && total > 1) {
                if (diff > total / 2) diff -= total;
                else if (diff < -total / 2) diff += total;
            }

            let scale = 1;
            let translateX = '-50%';
            let translateY = '-50%';
            let zIndex = 0;
            let opacity = 0;
            let pointerEvents = 'none';

            
            const dragOffsetValue = dragState.value.isDragging && diff === 0 
                ? (isVertical ? dragState.value.dragOffset : dragState.value.dragOffset) 
                : 0;

            
            if (diff === 0) { 
                scale = 1;
                zIndex = 3;
                opacity = 1;
                pointerEvents = 'auto';
                translateX = isVertical ? '-50%' : `calc(-50% + ${dragOffsetValue}px)`;
                translateY = isVertical ? `calc(-50% + ${dragOffsetValue}px)` : '-50%';
            } else if (diff === -1) { 
                scale = 0.9;
                zIndex = 2;
                opacity = 0.4;
                pointerEvents = 'none';
                translateX = isVertical ? '-50%' : `calc(-50% - 60px + ${dragOffsetValue}px)`;
                translateY = isVertical ? `calc(-50% - 60px + ${dragOffsetValue}px)` : '-50%';
            } else if (diff === 1) { 
                scale = 0.9;
                zIndex = 2;
                opacity = 0.4;
                pointerEvents = 'none';
                translateX = isVertical ? '-50%' : `calc(-50% + 60px + ${dragOffsetValue}px)`;
                translateY = isVertical ? `calc(-50% + 60px + ${dragOffsetValue}px)` : '-50%';
            } else { 
                scale = 0.8;
                zIndex = 0;
                opacity = 0;
                pointerEvents = 'none';
                
                if (props.content.loop && total > 1) {
                    
                    if (diff < -1) {
                        translateX = isVertical ? '-50%' : 'calc(-50% - 120px)';
                        translateY = isVertical ? 'calc(-50% - 120px)' : '-50%';
                    } else {
                        translateX = isVertical ? '-50%' : 'calc(-50% + 120px)';
                        translateY = isVertical ? 'calc(-50% + 120px)' : '-50%';
                    }
                } else {
                    translateX = isVertical ? '-50%' : (diff < 0 ? 'calc(-50% - 120px)' : 'calc(-50% + 120px)');
                    translateY = isVertical ? (diff < 0 ? 'calc(-50% - 120px)' : 'calc(-50% + 120px)') : '-50%';
                }
            }

            styles.transform = `translate(${translateX}, ${translateY}) scale(${scale})`;
            styles.zIndex = zIndex;
            styles.opacity = opacity;
            styles.pointerEvents = pointerEvents;
            
            
            if (dragState.value.isDragging && Math.abs(diff) <= 1) {
                styles.transition = 'opacity var(--transition-duration) ease-in-out, z-index 0s';
            }

            return styles;
        };

        const slideTo = newIndex => {
            if (nbOfSlides.value === 0) return;
            let finalIndex = newIndex;

            if (props.content.loop) {
                finalIndex = (newIndex % nbOfSlides.value + nbOfSlides.value) % nbOfSlides.value;
            } else {
                finalIndex = Math.max(0, Math.min(newIndex, nbOfSlides.value - 1));
            }

            
            if (isEditing.value) {
                emit('update:sidepanel-content', {
                    path: 'slideIndex',
                    value: finalIndex,
                });
            }
            sliderIndex.value = finalIndex;

            
            if (props.content.autoplay) {
                resetAutoplay();
            }
        };

        const slideNext = () => {
            if (isEditing.value || nbOfSlides.value <= 1) return;
            const nextIndex = props.content.loop 
                ? (sliderIndex.value + 1) % nbOfSlides.value
                : Math.min(sliderIndex.value + 1, nbOfSlides.value - 1);
            slideTo(nextIndex);
        };

        const slidePrev = () => {
            if (isEditing.value || nbOfSlides.value <= 1) return;
            const prevIndex = props.content.loop
                ? (sliderIndex.value - 1 + nbOfSlides.value) % nbOfSlides.value
                : Math.max(sliderIndex.value - 1, 0);
            slideTo(prevIndex);
        };

        const startAutoplay = () => {
            if (isEditing.value || !props.content.autoplay || nbOfSlides.value <= 1) return;
            if (autoplayIntervalId) clearInterval(autoplayIntervalId);
            autoplayIntervalId = setInterval(slideNext, autoplayIntervalMs.value);
        };

        const stopAutoplay = () => {
            if (autoplayIntervalId) {
                clearInterval(autoplayIntervalId);
                autoplayIntervalId = null;
            }
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        
        const handleDragStart = (e) => {
            if (isEditing.value) return;
            
            dragState.value.isDragging = true;
            
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            
            dragState.value.startX = clientX;
            dragState.value.startY = clientY;
            dragState.value.currentX = clientX;
            dragState.value.currentY = clientY;
            dragState.value.dragOffset = 0;
            
            
            if (props.content.autoplay) {
                stopAutoplay();
            }
            
            
            if (e.type === 'touchstart') {
                document.addEventListener('touchmove', handleDragMove);
                document.addEventListener('touchend', handleDragEnd);
            } else {
                document.addEventListener('mousemove', handleDragMove);
                document.addEventListener('mouseup', handleDragEnd);
            }
        };

        const handleDragMove = (e) => {
            if (!dragState.value.isDragging) return;
            
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            dragState.value.currentX = clientX;
            dragState.value.currentY = clientY;
            
            const isVertical = props.content.direction === 'vertical';
            
            if (isVertical) {
                dragState.value.dragOffset = clientY - dragState.value.startY;
            } else {
                dragState.value.dragOffset = clientX - dragState.value.startX;
            }
        };

        const handleDragEnd = () => {
            if (!dragState.value.isDragging) return;
            
            const isVertical = props.content.direction === 'vertical';
            const threshold = 50; 
            
            const dragDistance = isVertical 
                ? dragState.value.currentY - dragState.value.startY
                : dragState.value.currentX - dragState.value.startX;
            
            
            if (Math.abs(dragDistance) > threshold) {
                if (dragDistance > 0) {
                    
                    slidePrev();
                } else {
                    
                    slideNext();
                }
            }
            
            
            dragState.value.isDragging = false;
            dragState.value.dragOffset = 0;
            
            
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            
            
            if (props.content.autoplay) {
                resetAutoplay();
            }
        };

        
        const addSlide = async () => {
            const mainLayoutContent = [...props.content.mainLayoutContent];
            const slideLabels = [...(props.content.slideLabels || [])];

            while (slideLabels.length < mainLayoutContent.length) {
                slideLabels.push(`Slide ${slideLabels.length + 1}`);
            }

            if (mainLayoutContent.length === 0) {
                const slide = await createElement('ww-flexbox');
                mainLayoutContent.push(slide);
                slideLabels.push(`Slide 1`);
            } else {
                const { uid } = await cloneElement(mainLayoutContent[mainLayoutContent.length - 1].uid);
                mainLayoutContent.push(uid);
                slideLabels.push(`Slide ${mainLayoutContent.length}`);
            }
            emit('update:content', { mainLayoutContent, slideLabels });
            
            slideTo(mainLayoutContent.length - 1);
        };

        const removeSlide = index => {
            const mainLayoutContent = [...props.content.mainLayoutContent];
            const slideLabels = [...(props.content.slideLabels || [])];
            
            mainLayoutContent.splice(index, 1);
            if (slideLabels.length > index) {
                slideLabels.splice(index, 1);
            }

            emit('update:content', { mainLayoutContent, slideLabels });
            
            if (sliderIndex.value >= mainLayoutContent.length && mainLayoutContent.length > 0) {
                sliderIndex.value = mainLayoutContent.length - 1;
            } else if (mainLayoutContent.length === 0) {
                sliderIndex.value = 0;
            }
        };

        const moveSlideUp = index => {
            if (index <= 0) return;
            
            const mainLayoutContent = [...props.content.mainLayoutContent];
            const slideLabels = [...(props.content.slideLabels || [])];
            
            while (slideLabels.length < mainLayoutContent.length) {
                slideLabels.push(`Slide ${slideLabels.length + 1}`);
            }
            
            [mainLayoutContent[index], mainLayoutContent[index - 1]] = [mainLayoutContent[index - 1], mainLayoutContent[index]];
            [slideLabels[index], slideLabels[index - 1]] = [slideLabels[index - 1], slideLabels[index]];
            
            emit('update:content', { mainLayoutContent, slideLabels });
            
            if (sliderIndex.value === index) sliderIndex.value--;
            else if (sliderIndex.value === index - 1) sliderIndex.value++;
        };

        const moveSlideDown = index => {
            if (index >= props.content.mainLayoutContent.length - 1) return;
            
            const mainLayoutContent = [...props.content.mainLayoutContent];
            const slideLabels = [...(props.content.slideLabels || [])];
            
            while (slideLabels.length < mainLayoutContent.length) {
                slideLabels.push(`Slide ${slideLabels.length + 1}`);
            }
            
            [mainLayoutContent[index], mainLayoutContent[index + 1]] = [mainLayoutContent[index + 1], mainLayoutContent[index]];
            [slideLabels[index], slideLabels[index + 1]] = [slideLabels[index + 1], slideLabels[index]];
            
            emit('update:content', { mainLayoutContent, slideLabels });
            
            if (sliderIndex.value === index) sliderIndex.value++;
            else if (sliderIndex.value === index + 1) sliderIndex.value--;
        };

        const updateSlideLabel = ({ index, label }) => {
            const slideLabels = [...(props.content.slideLabels || [])];
            
            while (slideLabels.length <= index) {
                slideLabels.push(null);
            }
            
            slideLabels[index] = label;
            
            emit('update:content', { slideLabels });
        };
        

        
        watch(
            () => isEditing.value,
            (newVal) => {
                if (newVal) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            }
        );

        watch(
            () => props.wwEditorState.sidepanelContent.slideIndex,
            index => {
                if (!isEditing.value) return;
                if (sliderIndex.value !== index) {
                    sliderIndex.value = index;
                }
            }
        );

        watch(
            () => sliderIndex.value,
            index => {
                if (!isEditing.value) return;
                if (props.wwEditorState.sidepanelContent.slideIndex !== index) {
                    emit('update:sidepanel-content', {
                        path: 'slideIndex',
                        value: index,
                    });
                }
            }
        );
        

        watch(
            () => props.content.mainLayoutContent,
            (newContent) => {
                
                if (newContent.length === 0) {
                    sliderIndex.value = 0;
                } else if (sliderIndex.value >= newContent.length) {
                    sliderIndex.value = newContent.length - 1;
                }
                resetAutoplay();
            }, { deep: true }
        );

        watch(
            () => [props.content.autoplay, autoplayIntervalMs.value, props.content.loop, nbOfSlides.value, props.content.direction, transitionDurationMs.value],
            () => {
                
                resetAutoplay();
            }
        );

        onMounted(() => {
            if (!isEditing.value) startAutoplay();
        });

        onBeforeUnmount(() => {
            stopAutoplay();
            
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        });

        wwLib.wwElement.useRegisterElementLocalContext(
            'card-carousel',
            {
                sliderIndex,
                nbOfSlides,
                showLeftNav,
                showRightNav,
            },
            {
                setActiveItem: {
                    method: slideTo,
                    editor: {
                        label: 'Set Active Slide',
                        elementName: 'Card Carousel',
                        description: 'Set a specific slide as active by index.',
                        args: [
                            {
                                name: 'Index',
                                type: 'number',
                            },
                        ],
                    },
                },
                prev: {
                    method: slidePrev,
                    editor: {
                        label: 'Previous Slide',
                        elementName: 'Card Carousel',
                        description: 'Go to the previous slide.',
                    },
                },
                next: {
                    method: slideNext,
                    editor: {
                        label: 'Next Slide',
                        elementName: 'Card Carousel',
                        description: 'Go to the next slide.',
                    },
                },
            }
        );

        return {
            sliderIndex,
            isEditing,
            isSelected,
            nbOfSlides,
            showLeftNav,
            showRightNav,
            cssVariables,
            getSlideStyles,
            slideTo,
            slideNext,
            slidePrev,
            startAutoplay,
            stopAutoplay,
            
            addSlide,
            removeSlide,
            moveSlideUp,
            moveSlideDown,
            updateSlideLabel,
            
        };
    },
};
</script>

<style lang="scss" scoped>
.element-container {
    position: relative;
    overflow: visible; 
    width: 100%; 
    
    
    min-height: 200px; 
    &__status {
        position: absolute;
        top: -1px;
        color: var(--ww-color-white);
        padding: var(--ww-spacing-00) var(--ww-spacing-01);
        border-radius: var(--ww-spacing-00);
        background-color: var(--ww-color-blue-500);
        z-index: 100; 
        opacity: 0;
        pointer-events: none;
        right: -1px;
    }
    &.selected {
        > .element-container__status {
            opacity: 1;
            pointer-events: all;
        }
    }
    &.editing:hover {
        & > .border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 1px solid var(--ww-editor-color);
            pointer-events: none;
            z-index: 10;
        }
    }
    

    .card-carousel-wrapper {
        position: relative;
        width: 100%;
        height: 100%; 
        display: flex;
        justify-content: center;
        align-items: center;
        perspective: 1000px; 
        overflow: visible; 
    }

    .card-carousel-slides {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: visible; 

        &.is-vertical {
            flex-direction: column;
        }

        .slides-layout {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: visible; 
        }

        .card-carousel-slide {
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: center center;
            width: 90%;   
            height: 95%;  
            max-width: 380px; 
            display: flex;
            justify-content: center;
            align-items: center;
            
            
            transition:
                transform var(--transition-duration) ease-in-out,
                opacity var(--transition-duration) ease-in-out,
                z-index 0s;
            
            .slide-content {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: stretch;
                
                background: white;
                color: #333;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                overflow: auto;
                padding: 24px;
            }
        }
    }

    .bullets {
        pointer-events: all;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        display: flex;
        flex-direction: row;
        gap: 8px;
        .bullet-container {
            cursor: pointer;
            .bulletIcon {
                &:deep(.ww-icon-wrapper) {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 10px;
                    height: 10px;
                    background-color: #ccc;
                    border-radius: 50%;
                    transition: background-color var(--transition-duration) ease;
                }
                &.active, &.CurrentSlide {
                    &:deep(.ww-icon-wrapper) {
                        background-color: #007bff;
                    }
                }
            }
        }
    }

    .navigation-container {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background-color: rgba(0,0,0,0.2);
        color: white;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: rgba(0,0,0,0.4);
        }
        
        .layout-prev, .layout-next {
            &:deep(.ww-icon) {
                font-size: 1.5em;
                color: white;
            }
        }

        &.prev {
            left: 10px;
        }
        &.next {
            right: 10px;
        }
    }
}
</style>