export function zip<T, M>(xs: T[], ys: M[]): Array<[T, M]> {
    const collection: Array<[T, M]> = [];
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        collection.push([xs[i], ys[i]]);
    }
    return collection;
}
