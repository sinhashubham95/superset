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

/**
 * A showIf helper for showing any html element.
 *
 * @example
 *      {{showIf true}}     => ''
 *
 * @param {any} expression
 * @returns {string}
 */
export function showIf(expression: any) {
  return expression ? '' : 'hidden';
}

/**
 * A hideIf helper for hiding any html element.
 *
 * @example
 *      {{hideIf true}}     => 'hidden'
 *
 * @param {any} expression
 * @returns {string}
 */
export function hideIf(expression: any) {
  return expression ? 'hidden' : '';
}

/**
 * A selectedIf helper for dropdown and radio boxes.
 *
 * @example
 *      {{selectedIf true}} =>  'selected'
 *
 * @param {any} expression
 * @returns {string}
 */
export function selectedIf(expression: any) {
  return expression ? 'selected' : '';
}

/**
 * A checkedIf helper for checkboxes.
 *
 * @example
 *      {{checkedIf true}}  => 'checked'
 *
 * @param {any} expression
 * @returns {string}
 */
export function checkedIf(expression: any) {
  return expression ? 'checked' : '';
}

/**
 * An options helper for generating <option> list for <select> dropdowns.
 *
 * @example
 * A simple example:
 *
 *      const data = [
 *          {
 *              id: 1,
 *              description: 'Foo'
 *          },
 *          {
 *              id: 2,
 *              description: 'Bar'
 *          },
 *          {
 *              id: 3,
 *              description: 'Foo Bar'
 *          }
 *      ];
 *
 *      {{{options data selected="2"}}}
 *
 * will generate html like this:
 *
 *      <option value="1">Foo</option>
 *      <option value="2" selected>Bar</option>
 *      <option value="3">Foo Bar</option>
 *
 * @example
 * You can also override the default key names for 'id' & 'description'
 * using the 'id' & 'text' options in the helper.
 *
 *      const data = [
 *          {
 *              value: 1,
 *              text: 'New York'
 *          },
 *          {
 *              value: 2,
 *              text: 'London'
 *          }
 *      ];
 *
 *      {{{options data selected="1" id="value" text="text"}}}
 *
 * will generate html like this:
 *
 *      <option value="1" selected>New York</option>
 *      <option value="2">London</option>
 *
 * @param {array} data
 * @param {object} opts Object of options that includes id, text and selected attribute.
 * @returns {array}
 */
export function options(
  data: any[],
  opts: { hash: { id: string; text: string; selected: any } },
) {
  // The id & text for the <option>
  const id = opts.hash.id || 'id';
  const text = opts.hash.text || 'description';

  // The selection "id" of the <option>
  const selectedId = opts.hash.selected || null;

  return data
    .map(item => {
      const value = item[id] || '';
      const innerText = item[text] || '';
      const selected = value === selectedId ? ' selected' : '';

      return `<option value="${value}"${selected}>${innerText}</option>`;
    })
    .join('\n');
}
