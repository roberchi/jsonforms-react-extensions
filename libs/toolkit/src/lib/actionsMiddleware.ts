import { INIT, UPDATE_DATA, UPDATE_CORE, JsonFormsCore, CoreActions, Actions,   } from "@jsonforms/core";
import { IUISchemaToolkit } from "./interfaces";
import { ExceptionErrorObject, execute, prepare } from "./actions";
import _ from "lodash";
import { ErrorObject } from "ajv";

type SetStatusCallback = (status: any) => void;
type SetErrorsCallback = (errors: ErrorObject[]) => void;

export class ActionsMiddleware
{
    setStatusCallback:SetStatusCallback;
    setErrorsCallback:SetErrorsCallback;
    constructor(setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback) {
        this.setStatusCallback = setStatusCallback;
        this.setErrorsCallback = setErrorsCallback;
    }
    async = (state: JsonFormsCore, 
        action: CoreActions, 
        defaultReducer: (state: JsonFormsCore, action: CoreActions) => JsonFormsCore) => {
        switch (action.type) {
            case INIT:{
                console.log("Middleware INIT");
                // sort actions by dependencies
                const actionsToExecute = prepare((state.uischema as IUISchemaToolkit).actions);
                _.set(state, "actions", actionsToExecute);
                
                const afterReducer = defaultReducer(state, action);             
                    
                (async () => { 

                    try{
                        const actionsToExecute = _.get(state, "actions");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const result = await execute("on-init", actionsToExecute!, afterReducer);
                        this.setStatusCallback(result.data);
                    }
                    catch(e){
                        if(e instanceof ExceptionErrorObject)
                            this.setErrorsCallback([e.objectError]);
                        else
                            this.setErrorsCallback([{ instancePath:"/", keyword: 'action error', schemaPath: "(action)", params: {}, message: `call action error: ${(e as any).message}` }]);
                    }
                })();
                return afterReducer;
            }
            //case UPDATE_CORE:
            case UPDATE_DATA: {
                console.log("Middleware UPDATE_DATA");
                // execute actions and set new state  
                const afterReducer = defaultReducer(state, action);             
                    
                (async () => { 

                    try{
                        const actionsToExecute = _.get(state, "actions");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const result = await execute("on-change", actionsToExecute!, afterReducer, state);
                        this.setStatusCallback(result.data);
                    }
                    catch(e){
                        if(e instanceof ExceptionErrorObject)
                            this.setErrorsCallback([e.objectError]);
                        else
                            this.setErrorsCallback([{ instancePath:"/", keyword: 'action error', schemaPath: "(action)", params: {}, message: `call action error: ${(e as any).message}` }]);
                    }
                })();
                return afterReducer;
            }
            default:
                return defaultReducer(state, action);
        }
    }

    public static actionsMiddleware = (setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback) => {
        return new ActionsMiddleware(setStatusCallback, setErrorsCallback).async;
    }
}

