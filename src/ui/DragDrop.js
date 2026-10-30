/**
 * DragDrop - HTML5 Drag and Drop for wrenchbox
 * Phase 2: Drag icons from palette to character slots
 *
 * Learning goals:
 * - HTML5 Drag and Drop API
 * - DataTransfer for passing data between drag events
 * - Visual feedback during drag operations
 */

class DragDrop {
    constructor(options = {}) {
        this.onDrop = options.onDrop || (() => {});
        this.onRemove = options.onRemove || (() => {});

        // Track current drag state
        this.draggedSound = null;
        this.dragSource = null; // 'palette' or 'slot'
        this.dragSourceSlotId = null;
    }

    /**
     * Initialize drag-drop on palette icons and slots
     */
    init() {
        this.setupPaletteIcons();
        this.setupSlots();
        this.setupRemoveZone();
        console.log('[DragDrop] Initialized');
    }

    /**
     * Make palette icons draggable
     */
    setupPaletteIcons() {
        const icons = document.querySelectorAll('.sound-icon');

        icons.forEach(icon => {
            icon.draggable = true;

            icon.addEventListener('dragstart', (e) => {
                if (icon.classList.contains('used') || icon.draggable === false) {
                    e.preventDefault();
                    return;
                }

                this.draggedSound = icon.dataset.soundName;
                this.dragSource = 'palette';
                this.dragSourceSlotId = null;

                e.dataTransfer.setData('text/plain', this.draggedSound);
                e.dataTransfer.effectAllowed = 'copy';

                icon.classList.add('dragging');
                document.body.classList.add('is-dragging');
            });

            icon.addEventListener('dragend', () => {
                icon.classList.remove('dragging');
                document.body.classList.remove('is-dragging');
                this.clearDragState();
            });
        });
    }

    /**
     * Make slots accept drops and be draggable when filled
     */
    setupSlots() {
        const slots = document.querySelectorAll('.slot');

        slots.forEach(slot => {
            // Allow dropping on slots
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = this.dragSource === 'palette' ? 'copy' : 'move';
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                const slotId = parseInt(slot.dataset.slotId);
                const soundName = e.dataTransfer.getData('text/plain');

                if (soundName) {
                    // If dragging from another slot, remove from source first
                    if (this.dragSource === 'slot' && this.dragSourceSlotId !== null) {
                        if (this.dragSourceSlotId !== slotId) {
                            this.onRemove(this.dragSourceSlotId);
                        }
                    }
                    this.onDrop(slotId, soundName);
                }

                this.clearDragState();
            });

            // Make filled slots draggable (for moving/removing)
            slot.addEventListener('dragstart', (e) => {
                const soundName = slot.dataset.soundName;
                if (!soundName) {
                    e.preventDefault();
                    return;
                }

                this.draggedSound = soundName;
                this.dragSource = 'slot';
                this.dragSourceSlotId = parseInt(slot.dataset.slotId);

                e.dataTransfer.setData('text/plain', soundName);
                e.dataTransfer.effectAllowed = 'move';

                slot.classList.add('dragging');
                document.body.classList.add('is-dragging');
            });

            slot.addEventListener('dragend', () => {
                slot.classList.remove('dragging');
                document.body.classList.remove('is-dragging');
                this.clearDragState();
            });
        });
    }

    /**
     * Set up remove zone (palette acts as remove zone when dragging from slot)
     */
    setupRemoveZone() {
        const palette = document.querySelector('.palette');

        palette.addEventListener('dragover', (e) => {
            if (this.dragSource === 'slot') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                palette.classList.add('remove-zone-active');
            }
        });

        palette.addEventListener('dragleave', () => {
            palette.classList.remove('remove-zone-active');
        });

        palette.addEventListener('drop', (e) => {
            palette.classList.remove('remove-zone-active');

            if (this.dragSource === 'slot' && this.dragSourceSlotId !== null) {
                e.preventDefault();
                this.onRemove(this.dragSourceSlotId);
            }

            this.clearDragState();
        });
    }

    /**
     * Update slot draggable state (call after slot content changes)
     */
    updateSlotDraggable(slotElement, hasSoundAssigned) {
        slotElement.draggable = hasSoundAssigned;
    }

    /**
     * Clear drag state
     */
    clearDragState() {
        this.draggedSound = null;
        this.dragSource = null;
        this.dragSourceSlotId = null;
    }
}
