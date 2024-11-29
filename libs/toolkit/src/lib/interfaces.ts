import { UISchemaElement } from "@jsonforms/core";

// not-execute: the action is not executed, this behavior is used only to create action to be referenced 
export type actionBehavior = 'not-execute' | 'on-init' | 'on-change' | 'on-event';


export interface IActionBase{
    id?: string;
    behavior: actionBehavior | (actionBehavior)[];    
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
    actions: IAction[];
}

export interface IActionToExecute {
    "not-execute":IAction[];
    "on-init":IAction[];
    "on-change":IAction[];
    "on-event":IAction[];
}