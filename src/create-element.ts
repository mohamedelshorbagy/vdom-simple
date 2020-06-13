import { tCreateElement } from './types'
const createElement: tCreateElement = (tag = 'div', { attrs = {}, children = [], listeners = {} } = {}) => {
    return {
        tag,
        children,
        attrs,
        listeners
    }
}


export default createElement;
