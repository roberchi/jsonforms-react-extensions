import { UISchemaElement } from "@jsonforms/core";

export interface IAction {
    scope: string;
    kind: 'rest' | 'calc';
    depends: string[]|string;
}


export interface IUISchemaToolkit extends UISchemaElement {
    actions: IAction[];
}