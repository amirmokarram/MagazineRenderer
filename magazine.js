class MagazineRenderer {
    #containerEl = null;
    #magazine = null;

    constructor(containerEl, magazine) {
        this.#containerEl = containerEl;
        this.#magazine = magazine;
    }

    render() {
        let magazine = this.#magazine;
        let magazineEl = document.createElement("magazine");

        let pages = [];
        magazine.pages.forEach(page => {
            let pageRenderer = new PageRenderer(magazineEl, page);
            pageRenderer.render();

            pages.push(pageRenderer);
        });

        this.#containerEl.append(magazineEl);

        pages.forEach(page => page.checkOverflow());
    }
}
class PageRenderer {
    #containerEl = null;
    #page = null;
    #sections = [];

    constructor(containerEl, page) {
        this.#containerEl = containerEl;
        this.#page = page;
    }

    render() {
        let page = this.#page;

        let pageEl = document.createElement("page");
        pageEl.setAttribute("size", page.size);
        pageEl.setAttribute("layout", page.layout);

        this.#pagePartRenderer(pageEl, "header");
        this.#pagePartRenderer(pageEl, "content");
        this.#pagePartRenderer(pageEl, "footer");

        this.#containerEl.append(pageEl);
    }

    checkOverflow() {
        this.#sections.forEach(section => section.checkOverflow());
    }

    #pagePartRenderer(pageEl, partName) {
        let part = this.#page[partName];
        if (part == null)
            return;

        let partEl = document.createElement(partName);

        if (part.hasOwnProperty("sectionLayout"))
            partEl.setAttribute("layout", part.sectionLayout);
        if (part.landscape)
            partEl.style.writingMode = 'tb-rl';
        if (part.hasOwnProperty("padding"))
            partEl.style.padding = `${part.padding}mm`;
        if (part.hasOwnProperty("size"))
            partEl.style.height = `${part.size}mm`;

        part.sections.forEach(section => {
            let sectionRenderer = SectionRenderer.sectionRendererFactory(partEl, part, section);
            sectionRenderer.render();

            this.#sections.push(sectionRenderer);
        });

        pageEl.append(partEl);
    }
}
class SectionRenderer {
    #containerEl = null;
    #part = null;
    #section = null;
    #sectionEl = null;

    constructor(containerEl, part, section) {
        this.#containerEl = containerEl;
        this.#part = part;
        this.#section = section;
        this.#sectionEl = document.createElement("section");
    }

    get _section() {
        return this.#section;
    }
    get _sectionEl() {
        return this.#sectionEl;
    }
    get isLandscape() {
        return this.#part.landscape;
    }
    get isOverflowing() {
        return this.#sectionEl.scrollWidth > this.#sectionEl.clientWidth || this.#sectionEl.scrollHeight > this.#sectionEl.clientHeight;
    }

    render() {
        let section = this.#section;
        let sectionEl = this.#sectionEl;

        sectionEl.setAttribute("type", section.type);
        if (section.hasOwnProperty("mode"))
            sectionEl.setAttribute("mode", section.mode);

        if (section.hasOwnProperty("direction"))
            sectionEl.style.direction = section.direction;
        else
            sectionEl.setAttribute("dir", "auto");

        if (section.hasOwnProperty("align")) {
            sectionEl.style.justifyContent = this.#getFlexAlignment(section.align);
            sectionEl.style.textAlign = section.align;
        }

        if (section.hasOwnProperty("padding"))
            sectionEl.style.padding = `${section.padding}mm`;

        if (section.hasOwnProperty("verticalAlign"))
            sectionEl.style.alignItems = this.#getFlexAlignment(section.verticalAlign);

        if (section.hasOwnProperty("size")) {
            if (this.isLandscape)
                sectionEl.style.width = `${section.size}mm`;
            else
                sectionEl.style.height = `${section.size}mm`;
        }

        if (this._section.hasOwnProperty("fontSize"))
            this._sectionEl.style.fontSize = this._section.fontSize;

        if (this._section.hasOwnProperty("fontName"))
            this._sectionEl.style.fontFamily = this._section.fontName;

        this.#containerEl.append(sectionEl);
    }
    checkOverflow() {
        if (!this.isOverflowing)
            return;

        this._onOverflow(scope => {
            for (let i = scope.#sectionEl.children.length - 1; i >= 0; i--) {
                scope.#sectionEl.children[i].remove();
            }

            // Restore default font size
            if (scope._section.hasOwnProperty("fontSize"))
                scope._sectionEl.style.fontSize = scope._section.fontSize;
            else
                scope._sectionEl.style.fontSize = "";

            let overflowEl = document.createElement("div");
            overflowEl.style.width = "100%";
            overflowEl.style.height = "100%";
            overflowEl.style.textAlign = "center";
            overflowEl.style.justifyContent = "center";
            overflowEl.style.alignItems = "center";
            overflowEl.style.display = "flex";

            let imgEl = document.createElement("img");
            imgEl.src = "data:image/png;base64,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";
            if (scope.isLandscape)
                imgEl.style.transform = 'rotate(90deg)';
            overflowEl.append(imgEl);

            scope.#sectionEl.append(overflowEl);
        });
    }

    _onOverflow(contentTooSmallCallback) {
        let el = this._sectionEl;
        let currentFontSize = parseFloat(window.getComputedStyle(el).getPropertyValue('font-size'));
        let newFontSize = 0;
        if (el.scrollWidth > el.clientWidth)
            newFontSize = ((el.clientWidth / el.scrollWidth) * currentFontSize).toFixed(1);

        el.style.fontSize = `${newFontSize}px`;

        if (this.isOverflowing)
            this.#reduceFontSize(this, contentTooSmallCallback);
    }

    #reduceFontSize(scope, contentTooSmallCallback) {
        let el = scope._sectionEl;
        let currentFontSize = parseFloat(window.getComputedStyle(el).getPropertyValue('font-size'));

        el.style.fontSize = `${currentFontSize - 0.1}px`;

        if (currentFontSize <= 2) {
            contentTooSmallCallback(scope);
            return;
        }

        if (scope.isOverflowing)
            queueMicrotask(() => scope.#reduceFontSize(scope, contentTooSmallCallback));
    }
    #getFlexAlignment(value) {
        switch (value) {
            case "start":
            case "end":
                return `flex-${value}`;
            default:
                return value;
        }
    }

    static sectionRendererFactory(el, part, section) {
        switch (section.type) {
            case "text":
                return new TextSectionRenderer(el, part, section);
            case "image":
                return new ImageSectionRenderer(el, part, section);
            case "table":
                return new TableSectionRenderer(el, part, section);
            default:
                throw new Error(`The '${section.type}' section renderer is not defined.`);
        }
    }
}
class TextSectionRenderer extends SectionRenderer {
    constructor(...args) {
        super(...args);
    }

    render() {
        super.render();

        this._sectionEl.innerText = this._section.text;

        if (this._section.hasOwnProperty("bold") && this._section.bold)
            this._sectionEl.style.fontWeight = "bold";

        if (this._section.hasOwnProperty("italic") && this._section.italic)
            this._sectionEl.style.fontStyle = "italic";

        if (this._section.hasOwnProperty("underline") && this._section.underline)
            this._sectionEl.style.textDecoration = "underline";
    }
}
class ImageSectionRenderer extends SectionRenderer {
    constructor(...args) {
        super(...args);
    }

    render() {
        super.render();

        let imgEl = document.createElement("img");
        imgEl.src = this._section.source;

        if (this._section.hasOwnProperty("width"))
            imgEl.style.width = this._section.width;

        if (this._section.hasOwnProperty("height"))
            imgEl.style.height = this._section.height;

        if (this.isLandscape)
            imgEl.style.transform = 'rotate(90deg)';

        this._sectionEl.append(imgEl);
    }
}
class TableSectionRenderer extends SectionRenderer {
    constructor(...args) {
        super(...args);
    }

    render() {
        super.render();

        let tableEl = document.createElement("table");

        this._section.rows.forEach(row => {
            let rowEl = document.createElement("tr");

            row.cells.forEach(cell => {
                let cellEl = document.createElement("td");
                cellEl.innerText = cell.value;

                rowEl.append(cellEl);
            });

            tableEl.append(rowEl);
        });

        this._sectionEl.append(tableEl);
    }
}

export { MagazineRenderer };