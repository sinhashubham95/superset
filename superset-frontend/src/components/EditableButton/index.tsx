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
import React, { useEffect, useState, useRef } from 'react';
import Switchboard from '@superset-ui/switchboard';
import cx from 'classnames';
import Button from 'src/components/Button';

export interface EditableButtonProps {
  canEdit?: boolean;
  editing?: boolean;
  extraClasses?: Array<string> | string;
  onSaveTitle: (arg0: string) => void;
  style?: object;
  title?: string;
  defaultTitle?: string;
}

export default function EditableButton({
  canEdit = false,
  editing = false,
  extraClasses,
  onSaveTitle,
  style,
  title = '',
  defaultTitle = '',
  // rest is related to title tooltip
  ...rest
}: EditableButtonProps) {
  const [isEditing, setIsEditing] = useState(editing);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [lastTitle, setLastTitle] = useState(title);

  const contentRef = useRef<any | HTMLInputElement | HTMLTextAreaElement>();

  useEffect(() => {
    if (title !== currentTitle) {
      setLastTitle(currentTitle);
      setCurrentTitle(title);
    }
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      contentRef.current.focus();
      // move cursor and scroll to the end
      if (contentRef.current.setSelectionRange) {
        const { length } = contentRef.current.value;
        contentRef.current.setSelectionRange(length, length);
        contentRef.current.scrollLeft = contentRef.current.scrollWidth;
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }
  }, [isEditing]);

  function handleClick() {
    if (!canEdit || isEditing) {
      return;
    }
    setIsEditing(true);
  }

  function handleBlur() {
    const formattedTitle = currentTitle.trim();

    if (!canEdit) {
      return;
    }

    setIsEditing(false);

    if (!formattedTitle.length) {
      setCurrentTitle(lastTitle);
      return;
    }

    if (lastTitle !== formattedTitle) {
      setLastTitle(formattedTitle);
    }

    if (title !== formattedTitle) {
      onSaveTitle(formattedTitle);
    }
  }

  // tl;dr when a EditableButton is being edited, typically the Tab that wraps it has been
  // clicked and is focused/active. For accessibility, when the focused tab anchor intercepts
  // the ' ' key (among others, including all arrows) the onChange() doesn't fire. Somehow
  // keydown is still called so we can detect this and manually add a ' ' to the current title
  function handleKeyDown(event: any) {
    if (event.key === ' ') {
      event.stopPropagation();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      handleBlur();
    }
  }

  function handleChange(ev: any) {
    if (!canEdit) {
      return;
    }
    setCurrentTitle(ev.target.value);
  }

  function handleKeyPress(ev: any) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      handleBlur();
    }
  }

  let value: string | undefined;
  value = currentTitle;
  if (!isEditing && !currentTitle) {
    value = defaultTitle || title;
  }

  // Create a textarea when we're editing a multi-line value, otherwise create an input (which may
  // be text or a button).
  let component = (
    <input
      data-test="editable-button-input"
      ref={contentRef}
      type={isEditing ? 'text' : 'button'}
      value={value}
      className={!title ? 'text-muted' : undefined}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
    />
  );
  if (!canEdit) {
    // don't actually want an input in this case
    component = (
      <Button
        buttonStyle="default"
        buttonSize="default"
        onClick={() =>
          Switchboard.emit('click', { type: 'dashboard-button', value })
        }
      >
        {value}
      </Button>
    );
  }
  return (
    <span
      data-test="editable-button"
      className={cx(
        'editable-button',
        extraClasses,
        canEdit && 'editable-button--editable',
        isEditing && 'editable-button--editing',
      )}
      style={{
        ...style,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      {...rest}
    >
      {component}
    </span>
  );
}
