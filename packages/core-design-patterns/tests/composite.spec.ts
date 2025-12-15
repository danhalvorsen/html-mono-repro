import { Composite } from "core-design-patterns/dist/composite/demo/ui-framework/core/composite.js";
import { Leaf } from "core-design-patterns/dist/composite/demo/ui-framework/core/leaf.js";

class Box extends Composite {
    createElement(): HTMLElement {
        return document.createElement("ui-box");
    }
}

class Header extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement("ui-header");
        el.textContent = this.name;
        return el;
    }
}

class InputField extends Composite {
    createElement(): HTMLElement {
        return document.createElement("ui-input-field");
    }
}

class InputTypeText extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement("ui-input-type-text");
        el.textContent = "text";
        return el;
    }
}

class Validator extends Leaf {
    createElement(): HTMLElement {
        const el = document.createElement("ui-validator");
        el.textContent = this.name;
        return el;
    }
}

// -------------------------------
// DEMO COMPOSITE TREE
// -------------------------------

export function buildDemoTree() {
    const field = new InputField("NameField")
        .add(new InputTypeText("text"))
        .add(new Validator("required"))
        .add(new Validator("minLength:3"));

    return new Box("RootBox")
        .add(new Header("User Form"))
        .add(field);
}

// -------------------------------
// TRAVERSAL DEMO
// -------------------------------

export function traverse(node: any, indent: number = 0) {
    console.log(" ".repeat(indent) + node.name);
    for (const c of node.children) {
        traverse(c, indent + 2);
    }
}

// -------------------------------
// RUN DEMO
// -------------------------------

const ui = buildDemoTree();
traverse(ui);
