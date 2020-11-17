class PageRenderer {
    #page = null;

    constructor(page) {
        this.#page = page;
    }

    render(rootEl) {
        let page = this.#page;

        let pageEl = document.createElement("page-container");
        pageEl.setAttribute("size", page.size);
        pageEl.setAttribute("layout", page.layout);

        this.#pagePartRenderer(pageEl, "header");
        this.#pagePartRenderer(pageEl, "body");
        this.#pagePartRenderer(pageEl, "footer");

        rootEl.append(pageEl);
    }

    #pagePartRenderer(pageEl, partName) {
        let part = this.#page[partName];
        if (part == null)
            return;

        let partEl = document.createElement(`page-${partName}`);

        if (part.hasOwnProperty("sectionLayout"))
            partEl.setAttribute("layout", part.sectionLayout);
        if (part.hasOwnProperty("rotation"))
            partEl.style.transform = `rotate(${part.rotation}deg)`;
        if (part.hasOwnProperty("padding"))
            partEl.style.padding = `${part.padding}mm`;
        if (part.hasOwnProperty("size"))
            partEl.style.height = `${part.size}mm`;

        part.sections.forEach(section => {
            SectionRenderer.sectionRendererFactory(section).render(partEl);
        });

        pageEl.append(partEl);
    }
}
class SectionRenderer {
    #section = null;
    #sectionEl = null;

    constructor(section) {
        this.#section = section;
        this.#sectionEl = document.createElement("section");
    }

    get _section() {
        return this.#section;
    }
    get _sectionEl() {
        return this.#sectionEl;
    }

    render(parentEl) {
        let section = this.#section;
        let sectionEl = this.#sectionEl;

        sectionEl.setAttribute("type", section.type);
        if (section.hasOwnProperty("mode"))
            sectionEl.setAttribute("mode", section.mode);

        parentEl.append(sectionEl);
    }

    static sectionRendererFactory(section) {
        switch (section.type) {
            case "text":
                return new TextSectionRenderer(section);
            case "image":
                return new ImageSectionRenderer(section);
            case "table":
                return new TableSectionRenderer(section);
            default:
                throw new Error(`The '${section.type}' section renderer is not defined.`);
        }
    }
}
class TextSectionRenderer extends SectionRenderer {
    constructor(section) {
        super(section);
    }

    render(parentEl) {
        super.render(parentEl);

        this._sectionEl.innerText = this._section.text;

        if (this._section.hasOwnProperty("bold") && this._section.bold)
            this._sectionEl.style.fontWeight = "bold";

        if (this._section.hasOwnProperty("italic") && this._section.italic)
            this._sectionEl.style.fontStyle = "italic";

        if (this._section.hasOwnProperty("underline") && this._section.underline)
            this._sectionEl.style.textDecoration = "underline";

        if (this._section.hasOwnProperty("size"))
            this._sectionEl.style.fontSize = this._section.size;

        if (this._section.hasOwnProperty("align"))
            this._sectionEl.style.textAlign = this._section.align;
    }
}
class ImageSectionRenderer extends SectionRenderer {
    constructor(section) {
        super(section);
    }

    render(parentEl) {
        super.render(parentEl);

        let imgEl = document.createElement("img");
        imgEl.src = this._section.source;

        if (this._section.hasOwnProperty("width"))
            imgEl.style.width = this._section.width;

        if (this._section.hasOwnProperty("height"))
            imgEl.style.height = this._section.height;

        this._sectionEl.append(imgEl);
    }
}
class TableSectionRenderer extends SectionRenderer {
    constructor(section) {
        super(section);
    }

    render(parentEl) {
        super.render(parentEl);

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

export { PageRenderer };