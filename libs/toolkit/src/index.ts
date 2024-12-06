import { notYetImplemented, registerAction } from './lib/actions';
import { calcAction } from './lib/actions/calcAction';
import { ifAction, ifActionPrpeare } from './lib/actions/ifAction';
import { restAction } from './lib/actions/restAction';
import { setAction } from './lib/actions/setAction';

export * from './lib/toolkit';
export {ActionsMiddleware, getExecutionStatus} from './lib/actionsMiddleware';


// register actions for middleware
registerAction('rest', restAction);
registerAction(['calc', 'calculus'], calcAction);
registerAction(['if-then-else','if'], ifAction, ifActionPrpeare)
registerAction('switch', notYetImplemented)
registerAction('sequence', notYetImplemented)
registerAction(['for-each','foreach'], notYetImplemented)
registerAction('rise-event-on-array-change', notYetImplemented)
registerAction('set', setAction)



// TODO: use alias registerAction(['calculation','calc'], calcAction);
