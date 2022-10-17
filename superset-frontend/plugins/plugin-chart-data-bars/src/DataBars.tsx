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
import { css, styled } from '@superset-ui/core';
import React from 'react';
import Switchboard from '@superset-ui/switchboard';
import { DataBarsProps, DataBarsDataRecord } from './types';

const Styled = styled.div`
  ${({ theme }) => css`
    .data-list {
      display: flex;
      width: 100%;
      margin: ${theme.gridUnit * 4}px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }
    .data-list-item {
      width: 100%;
    }
    .data-list-item-value {
      display: flex;
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 1%;
    }
    .data-list-item-progress {
      margin-bottom: 1%;
      display: flex;
      width: 100%;
      flex-direction: row;
      height: 2%;
    }
    .progress {
      background-color: ${theme.colors.grayscale.light2};
      width: 100%;
      border-radius: 0px;
    }
    .progress-coloured {
      display: flex;
      height: 100%;
    }
    .value-label {
      font-size: 1rem;
      font-weight: 400;
    }
  `}
`;

export default function Handlebars(props: DataBarsProps) {
  const { data, formData } = props;

  const dimension = formData.groupby?.[0]
    ? formData.groupby?.[0].toString()
    : '';

  const onClick = (value: DataBarsDataRecord) => () => {
    Switchboard.emit('click', value);
  };

  return (
    <Styled>
      <ul className="data-list">
        {data
          .sort((a, b) => b.cnt - a.cnt)
          .map(({ cnt, percentage, colour, ...others }, idx) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={idx}
              className="data-list-item"
              onClick={onClick({
                cnt,
                percentage,
                colour,
                ...others,
              })}
            >
              <div className="data-list-item-value">
                <div className="value-label" style={{ color: colour }}>
                  {others[dimension]}
                </div>
                <div className="value-value">{cnt}</div>
              </div>
              <div className="data-list-item-progress">
                <div className="progress">
                  <span
                    className="progress-coloured"
                    style={{ width: `${percentage}%`, backgroundColor: colour }}
                  />
                </div>
              </div>
            </div>
          ))}
      </ul>
    </Styled>
  );
}
