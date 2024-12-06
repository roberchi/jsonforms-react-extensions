import { UISchemaElement } from "@jsonforms/core";

export type MaybePromise<T> = T | Promise<T>;

// not-execute: the action is not executed, this behavior is used only to create action to be referenced 
export type actionBehavior = 'refs' | 'on-init' | 'on-change' | 'on-event';


export interface IActionBase{
    id?: string;   
}
export interface IActionRef extends IActionBase {
    $ref: string;
}
export interface IAction extends IActionBase{
    scope: string;
    kind: 'rest' | 'calc';
    depends: string[]|string;
}


export interface IUISchemaToolkit extends UISchemaElement {
    actions: IActionToExecute;
}

export interface IActionToExecute {
    "refs":IAction[];
    "on-init":IAction[];
    "on-change":IAction[];
    "on-event":IAction[];
}