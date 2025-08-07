class Modal {
    static queue = [];
    static activeModal = null;
    static backdrop = null;

    constructor(title = '', width = 400, height = 'auto') {
        this.title = title;
        this.width = width;
        this.height = height;
        this.element = null;
        this.div = null;
        this._createModal();
        
        if (!Modal.backdrop) {
            Modal._createBackdrop();
        }

        if (Modal.activeModal) {
            Modal.queue.push(this);
        } else {
            this.show();
        }
    }

    _createModal() {
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
        this.element.style.height = this.height === 'auto' ? 'auto' : `${this.height}px`;

        const titleBar = document.createElement('div');
        titleBar.className = 'modal-title-bar';

        const titleText = document.createElement('span');
        titleText.className = 'modal-title';
        titleText.textContent = this.title;

        const closeButton = document.createElement('div');
        closeButton.className = 'modal-close-button';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.close());

        titleBar.appendChild(titleText);
        titleBar.appendChild(closeButton);

        this.div = document.createElement('div');
        this.div.className = 'modal-content';

        this.element.appendChild(titleBar);
        this.element.appendChild(this.div);
    }

    static _createBackdrop() {
        Modal.backdrop = document.createElement('div');
        Modal.backdrop.className = 'modal-backdrop';
        Modal.backdrop.style.display = 'none';
        document.body.appendChild(Modal.backdrop);
    }

    show() {
        Modal.activeModal = this;
        
        const menuItems = document.querySelectorAll('.menu-submenu.active');
        menuItems.forEach(menu => menu.classList.remove('active'));
        const activeMenuBarItems = document.querySelectorAll('.menu-bar-item.active');
        activeMenuBarItems.forEach(item => item.classList.remove('active'));

        Modal.backdrop.style.display = 'flex';
        Modal.backdrop.appendChild(this.element);

        requestAnimationFrame(() => {
            this.element.classList.add('modal-show');
            Modal.backdrop.classList.add('modal-backdrop-show');
        });
    }

    close() {
        if (Modal.activeModal !== this) {
            const index = Modal.queue.indexOf(this);
            if (index > -1) {
                Modal.queue.splice(index, 1);
            }
            return;
        }

        this.element.classList.remove('modal-show');
        Modal.backdrop.classList.remove('modal-backdrop-show');

        setTimeout(() => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            if (Modal.queue.length > 0) {
                const nextModal = Modal.queue.shift();
                nextModal.show();
            } else {
                Modal.activeModal = null;
                Modal.backdrop.style.display = 'none';
            }
        }, 200);
    }
}
