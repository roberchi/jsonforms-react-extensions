import { notYetImplemented, registerAction } from './lib/actions';
import { calcAction } from './lib/actions/calcAction';
import { copyAction } from './lib/actions/copyAction';
import { ifAction, ifActionPrpeare } from './lib/actions/ifAction';
import { restAction } from './lib/actions/restAction';
import { setAction } from './lib/actions/setAction';
import { switchAction, switchActionPrpeare } from './lib/actions/switchAction';

export * from './lib/toolkit';
export {ActionsMiddleware, getExecutionStatus} from './lib/actionsMiddleware';


// register actions for middleware
registerAction('rest', restAction);
registerAction(['calc', 'calculus'], calcAction);
registerAction(['if-then-else','if'], ifAction, ifActionPrpeare);
registerAction('switch', switchAction, switchActionPrpeare);
registerAction('copy', copyAction);
registerAction('sequence', notYetImplemented);
registerAction(['for-each','foreach'], notYetImplemented);
registerAction('rise-event-on-array-change', notYetImplemented);
registerAction('set', setAction);



// TODO: use alias registerAction(['calculation','calc'], calcAction);
