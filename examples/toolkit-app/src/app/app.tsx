import styled from 'styled-components';
import React, { useCallback, useMemo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialCells, materialRenderers } from '@jsonforms/material-renderers';
import test_schema from './test-schema.json';
import test_uischema from './test-uischema.json';
import test_data from './test-data.json';
import { ErrorObject } from 'ajv';
import { INIT, UPDATE_DATA, UPDATE_CORE, Middleware, CoreActions, JsonFormsCore } from  '@jsonforms/core'
import { ActionsMiddleware} from "@jsonforms-react-extensions/toolkit";
import { LinearProgress } from '@mui/material';

const renderers = [
  ...materialRenderers,
  //register toolkit renderers
  //...tookitRenderers
 
];

const StyledApp = styled.div`
  
`;


export function App() {

  const [data, setData] = useState(test_data);
  const [errors, setErrors] = useState<ErrorObject[]>();
  const [status, setStatus] = useState<"pending"|"fulfilled"|"failed">("fulfilled");
  const actionMiddleware = useMemo(() => ActionsMiddleware.actionsMiddleware(setData, setErrors,(s)=>setStatus(s)), [setData, setErrors]);

  return (
    <StyledApp>
      <div className='App'>
      {status === "pending" && <LinearProgress></LinearProgress>}
      <JsonForms
        schema={test_schema}
        uischema={test_uischema}
        data={data}
        renderers={renderers}
        cells={materialCells}
        middleware={actionMiddleware} 
        onChange={(state) => {
          setErrors(state.errors);
          setData(state.data);
        }
        }
      />
      <br></br>
      <div>{JSON.stringify(data)}</div>
      <ul>{errors?.map((e, i)=><li key={i}>{e.schemaPath} {e.message}</li>)}</ul>
    </div>

    </StyledApp>
  );
}

export default App;
