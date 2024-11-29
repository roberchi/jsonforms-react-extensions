import { INIT, UPDATE_DATA, UPDATE_CORE, JsonFormsCore, CoreActions, UISchemaActions, UISchemaElement } from "@jsonforms/core";
import { IUISchemaToolkit } from "./interfaces";
import { execute, prepare } from "./actions";
import _ from "lodash";


export const actionsMiddleware = (state: JsonFormsCore, 
    action: CoreActions, 
    defaultReducer: (state: JsonFormsCore, action: CoreActions) => JsonFormsCore) => {
    switch (action.type) {
        case INIT:{
            console.log("Middleware INIT");
            // sort actions by dependencies
            const actionsToExecute = prepare((state.uischema as IUISchemaToolkit).actions);
            _.set(state, "actions", actionsToExecute);
            const initState = execute("on-init", actionsToExecute, state);
            return defaultReducer(initState, action);
        }
        //case UPDATE_CORE:
        case UPDATE_DATA: {
            console.log("Middleware UPDATE_DATA");
            // execute actions and set new state   
            const newState = defaultReducer(state, action);             
            const actionsToExecute = _.get(state, "actions");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return execute("on-change", actionsToExecute!, newState, state);
        }
        default:
            return defaultReducer(state, action);
    }
};
