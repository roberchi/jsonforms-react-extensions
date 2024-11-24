import { render } from '@testing-library/react';

import Toolkit from './toolkit';

describe('Toolkit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Toolkit />);
    expect(baseElement).toBeTruthy();
  });
});
