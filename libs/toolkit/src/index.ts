import { notYetImplemented, registerAction } from './lib/actions';
import { calcAction } from './lib/actions/calcAction';
import { restAction } from './lib/actions/restAction';

export * from './lib/toolkit';
export {ActionsMiddleware, getExecutionStatus} from './lib/actionsMiddleware';
export {AsyncMiddleware} from './lib/asyncMiddleware';


// register actions for middleware
registerAction('rest', restAction);
registerAction('calc', calcAction);
registerAction('if-then-else', notYetImplemented)
registerAction('switch', notYetImplemented)
registerAction('sequence', notYetImplemented)
registerAction('for-each', notYetImplemented)
registerAction('rise-event-on-array-change', notYetImplemented)



// TODO: use alias registerAction(['calculation','calc'], calcAction);
