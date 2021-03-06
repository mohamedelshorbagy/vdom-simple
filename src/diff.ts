import { tDiff, tPatch, ElmVNode, VNode, Listener } from "./types";
import render from "./render";
import { zip } from "./utils";


const diffAttrs = (oldAttrs: object, newAttrs: object): tPatch => {
    const patches: tPatch[] = [];
    // add new attrs
    for (const [key, value] of Object.entries(newAttrs)) {
        if (!(key in oldAttrs) || ((key in oldAttrs) && oldAttrs[key] !== value)) {
            const patch: tPatch = domNode => {
                domNode.setAttribute(key, value);
                return domNode;
            };
            patches.push(patch);
        }
    }

    // delete old attrs
    for (const key in oldAttrs) {
        if (!(key in newAttrs)) {
            const patch: tPatch = domNode => {
                domNode.removeAttribute(key);
                return domNode;
            };
            patches.push(patch);
        }
    }

    return domNode => {
        // apply attrs patches
        for (let patch of patches) {
            patch(domNode);
        }
        return domNode;
    }
}



const diffListeners = (oldListeners: Listener, newListeners: Listener): tPatch => {

    const patches: tPatch[] = [];

    // add new listeners
    for (const [key, fnOrListenerObj] of Object.entries(newListeners)) {
        // add new listeners
        if (!(key in oldListeners)) {
            const patch: tPatch = domNode => {
                domNode.addEventListener(key, fnOrListenerObj);
                return domNode;
            };
            patches.push(patch);
        } else {
            // Diff. the callback fns
            // ? `true` => do nothing
            // : `false` => we have to remove it first then add it again
            const oldFnOrListenerObj = oldListeners[key];
            if (fnOrListenerObj !== oldFnOrListenerObj) {
                const patch: tPatch = domNode => {
                    domNode.removeEventListener(key, oldFnOrListenerObj);
                    domNode.addEventListener(key, oldFnOrListenerObj);
                    return domNode;
                }
                patches.push(patch);
            }
        }
    }

    // delete old listeners
    for (const [key, oldFnOrListenerObj] of Object.entries(oldListeners)) {
        if (!(key in newListeners)) {
            const patch: tPatch = domNode => {
                domNode.removeEventListener(key, oldFnOrListenerObj);
                return domNode;
            };
            patches.push(patch);
        }
    }

    return domNode => {
        // apply listener patches
        for (let patch of patches) {
            patch(domNode);
        }
        return domNode;
    }
}


const diffChildren = (oldChildren: VNode[], newChildren: VNode[]): tPatch => {

    // Case of old nodes
    const patches: tPatch[] = [];
    for (let [oldChild, newChild] of zip(oldChildren, newChildren)) {
        const patch = diff(oldChild, newChild);
        const newPatch = domNode => {
            patch(domNode);
            return domNode;
        }
        patches.push(newPatch);
    }

    // Case of new Nodes
    const newPatches: tPatch[] = [];
    for (let child of newChildren.slice(oldChildren.length)) {
        const newNode = render(child);
        const patch: tPatch = domNode => {
            domNode.appendChild(newNode);
            return domNode;
        }
        newPatches.push(patch);
    }

    return domNode => {

        // Patch old nodes
        // here we need the existing dom nodes 
        // so we use `childNodes` on domNode
        for (let [patch, child] of zip<tPatch, HTMLElement>(patches, domNode.childNodes as any)) {
            patch(child);
        }

        // Patch additional nodes
        for (let patch of newPatches) {
            patch(domNode);
        }

        return domNode;
    }


}

const diff: tDiff = (oldVNode, newVNode) => {

    // if node is empty so remove it from the DOM
    if (!newVNode) {
        const patch: tPatch = (domNode) => {
            domNode.remove();
            return undefined;
        }
        return patch;
    }

    // In case of different tags just replace with the new one
    if ((oldVNode as ElmVNode).tag !== (newVNode as ElmVNode).tag) {
        const newNode = render(newVNode);
        const patch: tPatch = domNode => {
            domNode.replaceWith(newNode);
            return newNode as HTMLElement;
        }
        return patch;
    }

    if (typeof oldVNode === 'string' && typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            const newNode = render(newVNode);
            const patch: tPatch = domNode => {
                domNode.replaceWith(newNode);
                return domNode;
            }
            return patch;
        } else {
            // Case Of Equality so we avoid going to base case
            return domNode => domNode;
        }
    }


    // Normal Case
    const patchAttrs = diffAttrs((oldVNode as ElmVNode).attrs, (newVNode as ElmVNode).attrs);
    const patchChildren = diffChildren((oldVNode as ElmVNode).children, (newVNode as ElmVNode).children);
    const patchListeners = diffListeners((oldVNode as ElmVNode).listeners, (newVNode as ElmVNode).listeners);

    return domNode => {
        // apply all patches
        patchAttrs(domNode);
        patchChildren(domNode);
        patchListeners(domNode);
        return domNode;
    }
}




export default diff;


