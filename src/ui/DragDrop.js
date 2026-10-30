/**
 * DragDrop - Pointer-based drag for wrenchbox
 * Works on desktop mouse AND iPad/iPhone touch (HTML5 DnD does not).
 */

class DragDrop {
    constructor(options = {}) {
        this.onDrop = options.onDrop || (() => {});
        this.onRemove = options.onRemove || (() => {});

        this.draggedSound = null;
        this.dragSource = null; // 'palette' | 'slot'
        this.dragSourceSlotId = null;
        this.dragSourceEl = null;

        this.active = false;
        this.moved = false;
        this.pointerId = null;
        this.startX = 0;
        this.startY = 0;
        this.ghost = null;
        this.suppressClick = false;

        this.DRAG_THRESHOLD = 8; // px before a press becomes a drag
    }

    init() {
        this.setupPaletteIcons();
        this.setupSlots();
        this.bindGlobalPointers();

        // Block the synthetic click after a real drag (esp. slot tap-to-remove)
        document.addEventListener(
            'click',
            (e) => {
                if (!this.suppressClick) return;
                e.preventDefault();
                e.stopPropagation();
                this.suppressClick = false;
            },
            true
        );

        console.log('[DragDrop] Initialized (pointer / touch)');
    }

    setupPaletteIcons() {
        document.querySelectorAll('.sound-icon').forEach((icon) => {
            icon.setAttribute('draggable', 'false');
            icon.classList.add('touch-draggable');
            icon.addEventListener('pointerdown', (e) => {
                if (icon.classList.contains('used')) return;
                if (e.button != null && e.button !== 0) return;
                this.beginDrag(e, {
                    soundName: icon.dataset.soundName,
                    source: 'palette',
                    sourceSlotId: null,
                    sourceEl: icon,
                    ghostContent: icon.innerHTML,
                });
            });
        });
    }

    setupSlots() {
        document.querySelectorAll('.slot').forEach((slot) => {
            slot.setAttribute('draggable', 'false');
            slot.addEventListener('pointerdown', (e) => {
                // Don't steal mute/solo taps
                if (e.target.closest('.slot-btn')) return;
                if (e.button != null && e.button !== 0) return;

                const soundName = slot.dataset.soundName;
                if (!soundName) return;

                const iconEl = slot.querySelector('.slot-icon');
                this.beginDrag(e, {
                    soundName,
                    source: 'slot',
                    sourceSlotId: parseInt(slot.dataset.slotId, 10),
                    sourceEl: slot,
                    ghostContent: iconEl ? iconEl.innerHTML : '🎵',
                });
            });
        });
    }

    bindGlobalPointers() {
        document.addEventListener('pointermove', (e) => this.onPointerMove(e), {
            passive: false,
        });
        document.addEventListener('pointerup', (e) => this.onPointerUp(e));
        document.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    }

    beginDrag(e, { soundName, source, sourceSlotId, sourceEl, ghostContent }) {
        if (!soundName || this.active) return;

        this.active = true;
        this.moved = false;
        this.pointerId = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.draggedSound = soundName;
        this.dragSource = source;
        this.dragSourceSlotId = sourceSlotId;
        this.dragSourceEl = sourceEl;
        this._ghostContent = ghostContent;

        try {
            sourceEl.setPointerCapture(e.pointerId);
        } catch (_) {
            /* ignore */
        }

        // Don't preventDefault yet — wait for threshold so taps still work
    }

    onPointerMove(e) {
        if (!this.active || e.pointerId !== this.pointerId) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        if (!this.moved) {
            if (Math.hypot(dx, dy) < this.DRAG_THRESHOLD) return;
            this.moved = true;
            this.startGhost(e.clientX, e.clientY);
            if (this.dragSourceEl) {
                this.dragSourceEl.classList.add('dragging');
            }
            document.body.classList.add('is-dragging');
        }

        e.preventDefault();
        this.moveGhost(e.clientX, e.clientY);
        this.updateHoverTargets(e.clientX, e.clientY);
    }

    onPointerUp(e) {
        if (!this.active || e.pointerId !== this.pointerId) return;

        const x = e.clientX;
        const y = e.clientY;
        const didDrag = this.moved;

        if (didDrag) {
            e.preventDefault();
            this.suppressClick = true;
            this.commitDrop(x, y);
        }

        this.teardownDrag();
    }

    startGhost(x, y) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.innerHTML = this._ghostContent || '';
        document.body.appendChild(ghost);
        this.ghost = ghost;
        this.moveGhost(x, y);
    }

    moveGhost(x, y) {
        if (!this.ghost) return;
        this.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }

    updateHoverTargets(x, y) {
        document
            .querySelectorAll('.slot.drag-over, .palette.remove-zone-active')
            .forEach((el) => {
                el.classList.remove('drag-over', 'remove-zone-active');
            });

        const target = this.hitTest(x, y);
        if (!target) return;

        if (target.kind === 'slot') {
            target.el.classList.add('drag-over');
        } else if (target.kind === 'palette' && this.dragSource === 'slot') {
            target.el.classList.add('remove-zone-active');
        }
    }

    hitTest(x, y) {
        // Ghost blocks hit-testing — hide briefly
        const ghost = this.ghost;
        if (ghost) ghost.style.visibility = 'hidden';
        const el = document.elementFromPoint(x, y);
        if (ghost) ghost.style.visibility = 'visible';
        if (!el) return null;

        const slot = el.closest('.slot');
        if (slot) {
            return {
                kind: 'slot',
                el: slot,
                slotId: parseInt(slot.dataset.slotId, 10),
            };
        }

        const palette = el.closest('.palette');
        if (palette) {
            return { kind: 'palette', el: palette };
        }

        return null;
    }

    commitDrop(x, y) {
        const target = this.hitTest(x, y);
        if (!target || !this.draggedSound) return;

        if (target.kind === 'slot') {
            const slotId = target.slotId;
            if (
                this.dragSource === 'slot' &&
                this.dragSourceSlotId !== null &&
                this.dragSourceSlotId !== slotId
            ) {
                this.onRemove(this.dragSourceSlotId);
            }
            // Same slot: no-op re-drop
            if (
                this.dragSource === 'slot' &&
                this.dragSourceSlotId === slotId
            ) {
                return;
            }
            this.onDrop(slotId, this.draggedSound);
            return;
        }

        if (target.kind === 'palette' && this.dragSource === 'slot') {
            this.onRemove(this.dragSourceSlotId);
        }
    }

    teardownDrag() {
        if (this.dragSourceEl) {
            this.dragSourceEl.classList.remove('dragging');
            try {
                this.dragSourceEl.releasePointerCapture(this.pointerId);
            } catch (_) {
                /* ignore */
            }
        }

        document
            .querySelectorAll('.slot.drag-over, .palette.remove-zone-active')
            .forEach((el) => {
                el.classList.remove('drag-over', 'remove-zone-active');
            });
        document.body.classList.remove('is-dragging');

        if (this.ghost) {
            this.ghost.remove();
            this.ghost = null;
        }

        this.active = false;
        this.moved = false;
        this.pointerId = null;
        this.dragSourceEl = null;
        this.clearDragState();
    }

    updateSlotDraggable(slotElement, hasSoundAssigned) {
        slotElement.classList.toggle('touch-draggable', !!hasSoundAssigned);
        slotElement.setAttribute('draggable', 'false');
    }

    clearDragState() {
        this.draggedSound = null;
        this.dragSource = null;
        this.dragSourceSlotId = null;
    }
}
