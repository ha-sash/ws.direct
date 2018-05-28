declare const console: any;

export function apiMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (!target.hasOwnProperty("___apiMethodList")) {
        target.___apiMethodList = {};
    }
    if (!target.hasOwnProperty("apiMethods")) {
        target.apiMethods = () => {
            return target.___apiMethodList;
        };
    }
    target.___apiMethodList[propertyKey] = true;
}
