import { INIT, UPDATE_DATA, UPDATE_CORE, JsonFormsCore, CoreActions, UISchemaActions, UISchemaElement } from "@jsonforms/core";
import _, { sortBy } from 'lodash';
import { IUISchemaToolkit } from "./interfaces";
import { executeActions, sortByActionDependencies } from "./actions";
import { exec } from "child_process";



export const actionsMiddleware = (state: JsonFormsCore, 
    action: CoreActions, 
    defaultReducer: (state: JsonFormsCore, action: CoreActions) => JsonFormsCore) => {
    const newState = defaultReducer(state, action);
    console.log('New state 1', newState);
            
    switch (action.type) {
        case INIT:
            // sort actions by dependencies
            (newState.uischema as IUISchemaToolkit).actions  = sortByActionDependencies((newState.uischema as IUISchemaToolkit).actions);
            return newState;
        case UPDATE_CORE:
        case UPDATE_DATA: {
            // execute actions and set new state
            const actions = (newState.uischema as IUISchemaToolkit).actions;
            return executeActions(actions, newState, state);
        }
        default:
            return newState;
    }
};
