/* tslint:disable no-conditional-assignment */
export function apiMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (!target.hasOwnProperty("apiMethods")) {
        target.apiMethods = function() {
            let props: any = [];
            let obj: any = this;
            if (this.apiMethodsCache) {
                return this.apiMethodsCache;
            }

            this.apiMethodsCache = {};

            do {
                props = props.concat(Object.getOwnPropertyNames(obj));
            } while (obj = Object.getPrototypeOf(obj));

            for (const m of props) {
                if (this[m] && typeof this[m] === "function" && this[m].isApiMethod) {
                    this.apiMethodsCache[m] = true;
                }
            }
            return this.apiMethodsCache;
        };
    }
    target[propertyKey].isApiMethod = true;
}
