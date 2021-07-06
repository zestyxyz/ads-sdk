class Zesty extends HTMLElement {
    constructor() {
        super();
        console.log("Loaded");
    }

    render() {
        this.innerHTML = `
            <div>
                <h1>Zesty</h1>
            </div>
        `
    }
}

customElements.define("zesty-web", Zesty);
