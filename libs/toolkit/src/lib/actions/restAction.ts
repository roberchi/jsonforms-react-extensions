import { JsonFormsCore } from "@jsonforms/core";
import { EvalAction } from "../actions";
import { IAction } from "../interfaces";

export interface IActionRest extends IAction {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body: any;
}

export const restAction:EvalAction = (act: IAction, state:JsonFormsCore) : JsonFormsCore => {
    console.log('Rest action', act);
    return state;
}