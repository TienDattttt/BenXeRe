import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const Tooltip = ({ children, content }) => {
  return (
    <div>
      <div data-tooltip-id="tooltip" data-tooltip-content={content}>
        {children}
      </div>
      <ReactTooltip id="tooltip" />
    </div>
  );
};

export default Tooltip;