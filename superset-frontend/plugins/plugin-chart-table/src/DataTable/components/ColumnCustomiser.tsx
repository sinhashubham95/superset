import React, { CSSProperties } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import { ColumnConfig } from '@superset-ui/chart-controls';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import { formatLabel } from '../utils/formatLabel';

export interface Item {
  key: string;
  text: string;
  hide?: boolean;
  isCheckboxDisabled?: boolean;
  onColumnHide: () => void;
  className?: string;
}

export interface Column {
  key: string;
  label: string;
  hide?: boolean;
  config?: ColumnConfig;
}

export interface ColumnCustomiserProps<D extends Column> {
  columns: D[];
  onColumnHide: (index: number) => void;
  style?: CSSProperties;
}

const DragHandle = SortableHandle(() => (
  <IconButton edge="end">
    <DragHandleIcon />
  </IconButton>
));

const SortableItem = SortableElement<Item>(function Item({
  key,
  text,
  hide,
  isCheckboxDisabled,
  onColumnHide,
  className,
}: Item) {
  return (
    <ListItem
      className={className}
      key={key}
      disabled={isCheckboxDisabled}
      onClick={isCheckboxDisabled ? undefined : onColumnHide}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          className={
            isCheckboxDisabled ? 'disabled-sortable-item-check' : undefined
          }
          checked={!hide}
          disabled={isCheckboxDisabled}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': key }}
        />
      </ListItemIcon>
      <ListItemText primary={text} />
      <ListItemSecondaryAction>
        <DragHandle />
      </ListItemSecondaryAction>
    </ListItem>
  );
});

export default React.memo(
  SortableContainer(function ColumnCustomiser<D extends Column>({
    columns,
    style,
    onColumnHide,
  }: ColumnCustomiserProps<D>) {
    const isCheckboxDisabled = columns.filter(col => !col.hide).length === 1;

    return (
      <List component={Paper} style={style}>
        {columns.map(({ key, label, hide, config }, index) => (
          <SortableItem
            key={key}
            text={formatLabel(label)}
            hide={hide}
            isCheckboxDisabled={isCheckboxDisabled || !!config?.isFixed}
            index={index}
            onColumnHide={() => onColumnHide(index)}
            disabled={!!config?.isFixed}
            className={config?.isFixed ? 'fixed-column' : undefined}
          />
        ))}
      </List>
    );
  }),
);
