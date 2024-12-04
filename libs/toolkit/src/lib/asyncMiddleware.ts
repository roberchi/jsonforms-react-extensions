import { INIT, UPDATE_DATA, JsonFormsCore, CoreActions, Actions,   } from "@jsonforms/core";
import { ErrorObject } from "ajv";
import _ from "lodash";

type SetStatusCallback = (status: any) => void;
type SetErrorsCallback = (errors: ErrorObject[]) => void;

export class AsyncMiddleware
{
    setStatusCallback:SetStatusCallback;
    setErrorsCallback:SetErrorsCallback;
    constructor(setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback) {
        this.setStatusCallback = setStatusCallback;
        this.setErrorsCallback = setErrorsCallback;
    }
    asyncMiddleware = (state: JsonFormsCore, 
        action: CoreActions, 
        defaultReducer: (state: JsonFormsCore, action: CoreActions) => JsonFormsCore) => {
        switch (action.type) {
            case UPDATE_DATA: {
                const newState = defaultReducer(state, action);             
                
                (async () => { 
                    const result = await fetch('http://localhost:3001/employees');
                    if(result.status === 200) {
                        const data = await result.json();
                        // how to update state with data??
                        console.log(newState);
                        this.setStatusCallback({...newState.data, employees: data});
                    }
                    else {
                        // how to update state with error??
                        this.setErrorsCallback([{ instancePath:"/", keyword: 'http error', schemaPath: "(action)", params: {}, message: `call rest service error: ${result.status}` }]);
                    }
    
                })();
    
                return newState;
            }
            default:
                return defaultReducer(state, action);
        }
    };

    public static asyncMiddleware = (setStatusCallback:SetStatusCallback, setErrorsCallback:SetErrorsCallback) => {
        return new AsyncMiddleware(setStatusCallback, setErrorsCallback).asyncMiddleware;
    }
}
