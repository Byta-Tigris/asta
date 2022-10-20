export interface Constructor<T, A = any> {
    new (...args: A[]): T;
}
