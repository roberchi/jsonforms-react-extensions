declare module "@nx-js/compiler-util" {
    export function parseCode (src:string):any;
    export function parseExpression (src:string):any;
    export function expose (...globalNames:string[]):void;
    export function hide (...globalNames:string[]):void;
    export function hideAll ():void;
    
    export const filters;
    export const limiters;
    export function filter (name:string, handler:function);
    export function limiter (name:string, handler:function);

    export function compileExpression (src:string):evaluateExpression;
    export function compileCode (src:string):evaluateCode;
    export type evaluateCode = (state?:any, tempVars?:any)=>any;
    export type evaluateExpression = (state?:any, tempVars?:any)=>any;
    
}