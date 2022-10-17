/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import PopoverDropdown from 'src/components/PopoverDropdown';
import ResizableContainer from 'src/dashboard/components/resizable/ResizableContainer';
import EditableButton from 'src/components/EditableButton';
import DragDroppable from 'src/dashboard/components/dnd/DragDroppable';
import DragHandle from 'src/dashboard/components/dnd/DragHandle';
import HoverMenu from 'src/dashboard/components/menu/HoverMenu';
import WithPopoverMenu from 'src/dashboard/components/menu/WithPopoverMenu';
import BackgroundStyleDropdown from 'src/dashboard/components/menu/BackgroundStyleDropdown';
import DeleteComponentButton from 'src/dashboard/components/DeleteComponentButton';
import headerStyleOptions from 'src/dashboard/util/headerStyleOptions';
import backgroundStyleOptions from 'src/dashboard/util/backgroundStyleOptions';
import { componentShape } from 'src/dashboard/util/propShapes';
import { ROW_TYPE, COLUMN_TYPE } from 'src/dashboard/util/componentTypes';
import {
  SMALL_HEADER,
  BACKGROUND_TRANSPARENT,
  GRID_MIN_COLUMN_COUNT,
  GRID_MIN_ROW_UNITS,
  GRID_BASE_UNIT,
} from 'src/dashboard/util/constants';

const propTypes = {
  id: PropTypes.string.isRequired,
  dashboardId: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired,
  component: componentShape.isRequired,
  depth: PropTypes.number.isRequired,
  parentComponent: componentShape.isRequired,
  index: PropTypes.number.isRequired,
  editMode: PropTypes.bool.isRequired,

  // redux
  handleComponentDrop: PropTypes.func.isRequired,
  deleteComponent: PropTypes.func.isRequired,
  updateComponents: PropTypes.func.isRequired,
};

const defaultProps = {};

class Button extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    };
    this.handleDeleteComponent = this.handleDeleteComponent.bind(this);
    this.handleChangeFocus = this.handleChangeFocus.bind(this);
    this.handleUpdateMeta = this.handleUpdateMeta.bind(this);
    this.handleChangeSize = this.handleUpdateMeta.bind(this, 'headerSize');
    this.handleChangeBackground = this.handleUpdateMeta.bind(
      this,
      'background',
    );
    this.handleChangeText = this.handleUpdateMeta.bind(this, 'text');
  }

  handleChangeFocus(nextFocus) {
    this.setState(() => ({ isFocused: nextFocus }));
  }

  handleUpdateMeta(metaKey, nextValue) {
    const { updateComponents, component } = this.props;
    if (nextValue && component.meta[metaKey] !== nextValue) {
      updateComponents({
        [component.id]: {
          ...component,
          meta: {
            ...component.meta,
            [metaKey]: nextValue,
          },
        },
      });
    }
  }

  handleDeleteComponent() {
    const { deleteComponent, id, parentId } = this.props;
    deleteComponent(id, parentId);
  }

  render() {
    const { isFocused } = this.state;

    const {
      dashboardId,
      component,
      depth,
      parentComponent,
      index,
      handleComponentDrop,
      editMode,
      columnWidth,
      availableColumnCount,
      onResize,
      onResizeStart,
      onResizeStop,
    } = this.props;

    const headerStyle = headerStyleOptions.find(
      opt => opt.value === (component.meta.headerSize || SMALL_HEADER),
    );

    const rowStyle = backgroundStyleOptions.find(
      opt =>
        opt.value === (component.meta.background || BACKGROUND_TRANSPARENT),
    );

    // inherit the size of parent columns
    const widthMultiple =
      parentComponent.type === COLUMN_TYPE
        ? parentComponent.meta.width || GRID_MIN_COLUMN_COUNT
        : component.meta.width || GRID_MIN_COLUMN_COUNT;

    return (
      <DragDroppable
        component={component}
        parentComponent={parentComponent}
        orientation={parentComponent.type === ROW_TYPE ? 'column' : 'row'}
        index={index}
        depth={depth}
        onDrop={handleComponentDrop}
        disableDragDrop={isFocused}
        editMode={editMode}
      >
        {({ dropIndicatorProps, dragSourceRef }) => (
          <div ref={dragSourceRef}>
            {editMode &&
              depth <= 2 && ( // drag handle looks bad when nested
                <HoverMenu position="left">
                  <DragHandle position="left" />
                </HoverMenu>
              )}
            <WithPopoverMenu
              onChangeFocus={this.handleChangeFocus}
              menuItems={[
                <PopoverDropdown
                  id={`${component.id}-header-style`}
                  options={headerStyleOptions}
                  value={component.meta.headerSize}
                  onChange={this.handleChangeSize}
                />,
                <BackgroundStyleDropdown
                  id={`${component.id}-background`}
                  value={component.meta.background}
                  onChange={this.handleChangeBackground}
                />,
              ]}
              editMode={editMode}
            >
              <div
                className={cx(
                  'dashboard-component',
                  'dashboard-component-button',
                  headerStyle.className,
                  rowStyle.className,
                )}
              >
                <ResizableContainer
                  id={component.id}
                  adjustableWidth={parentComponent.type === ROW_TYPE}
                  adjustableHeight
                  widthStep={columnWidth}
                  widthMultiple={widthMultiple}
                  heightStep={GRID_BASE_UNIT}
                  heightMultiple={component.meta.height}
                  minWidthMultiple={GRID_MIN_COLUMN_COUNT}
                  minHeightMultiple={GRID_MIN_ROW_UNITS}
                  maxWidthMultiple={availableColumnCount + widthMultiple}
                  onResizeStart={onResizeStart}
                  onResize={onResize}
                  onResizeStop={onResizeStop}
                  editMode={isFocused ? false : editMode}
                >
                  {editMode && (
                    <HoverMenu position="top">
                      <DeleteComponentButton
                        onDelete={this.handleDeleteComponent}
                      />
                    </HoverMenu>
                  )}
                  <EditableButton
                    title={component.meta.text}
                    canEdit={editMode}
                    onSaveTitle={this.handleChangeText}
                    showTooltip={false}
                  />
                </ResizableContainer>
              </div>
            </WithPopoverMenu>
            {dropIndicatorProps && <div {...dropIndicatorProps} />}
          </div>
        )}
      </DragDroppable>
    );
  }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
