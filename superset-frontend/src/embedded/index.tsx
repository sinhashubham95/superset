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
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { makeApi, t, logging } from '@superset-ui/core';
import Switchboard from '@superset-ui/switchboard';
import { bootstrapData } from 'src/preamble';
import setupClient from 'src/setup/setupClient';
import { RootContextProviders } from 'src/views/RootContextProviders';
import { store, USER_LOADED } from 'src/views/store';
import ErrorBoundary from 'src/components/ErrorBoundary';
import Loading from 'src/components/Loading';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import { BootstrapUser, UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';

const debugMode = process.env.WEBPACK_MODE === 'development';

function log(...info: unknown[]) {
  if (debugMode) {
    logging.debug(`[superset]`, ...info);
  }
}

function logAndReload(error: any, info: any) {
  log('error loading embeded frame', error, info);

  // get the attempt
  const location = new URL(window.location.href);
  let attempt = location.searchParams.get('attempt');
  if (!attempt) {
    attempt = '1';
  }

  // check if attempts exhausted
  let a = JSON.parse(attempt);
  if (a >= 3) {
    // exhausted and do nothing here
  }

  // retry
  a += 1;
  location.searchParams.set('attempt', JSON.stringify(a));
  log('retrying embed', a, location);
  window.location.replace(location.toString());
}

const LazyDashboardPage = lazy(
  () =>
    import(
      /* webpackChunkName: "DashboardPage" */ 'src/dashboard/containers/DashboardPage'
    ),
);

const EmbeddedRoute = () => (
  <Suspense fallback={<Loading />}>
    <RootContextProviders>
      <ErrorBoundary onError={logAndReload}>
        <LazyDashboardPage idOrSlug={bootstrapData.embedded!.dashboard_id} />
      </ErrorBoundary>
      <ToastContainer position="top" />
    </RootContextProviders>
  </Suspense>
);

const EmbeddedApp = () => (
  <Router>
    {/* todo (embedded) remove this line after uuids are deployed */}
    <Route path="/dashboard/:idOrSlug/embedded/" component={EmbeddedRoute} />
    <Route path="/embedded/:uuid/" component={EmbeddedRoute} />
  </Router>
);

const appMountPoint = document.getElementById('app')!;

const MESSAGE_TYPE = '__embedded_comms__';

function showFailureMessage(message: string) {
  appMountPoint.innerHTML = message;
}

if (!window.parent || window.parent === window) {
  showFailureMessage(
    'This page is intended to be embedded in an iframe, but it looks like that is not the case.',
  );
}

// if the page is embedded in an origin that hasn't
// been authorized by the curator, we forbid access entirely.
// todo: check the referrer on the route serving this page instead
// const ALLOW_ORIGINS = ['http://127.0.0.1:9001', 'http://localhost:9001'];
// const parentOrigin = new URL(document.referrer).origin;
// if (!ALLOW_ORIGINS.includes(parentOrigin)) {
//   throw new Error(
//     `[superset] iframe parent ${parentOrigin} is not in the list of allowed origins`,
//   );
// }

let displayedUnauthorizedToast = false;

/**
 * If there is a problem with the guest token, we will start getting
 * 401 errors from the api and SupersetClient will call this function.
 */
function guestUnauthorizedHandler() {
  if (displayedUnauthorizedToast) return; // no need to display this message every time we get another 401
  displayedUnauthorizedToast = true;
  // If a guest user were sent to a login screen on 401, they would have no valid login to use.
  // For embedded it makes more sense to just display a message
  // and let them continue accessing the page, to whatever extent they can.
  store.dispatch(
    addDangerToast(
      t(
        'This session has encountered an interruption, and some controls may not work as intended. If you are the developer of this app, please check that the guest token is being generated correctly.',
      ),
      {
        duration: -1, // stay open until manually closed
        noDuplicate: true,
      },
    ),
  );
}

function start() {
  const result: BootstrapUser = {
    firstName: 'nxt',
    isActive: false,
    isAnonymous: false,
    lastName: 'orchestrator',
    permissions: {},
    roles: {
      Guest: [
        ['can_download', 'DynamicPlugin'],
        ['can_read', 'AdvancedDataType'],
        ['can_list', 'DynamicPlugin'],
        ['can_validate_sql_json', 'Superset'],
        ['can_this_form_post', 'ColumnarToDatabaseView'],
        ['can_recent_activity', 'Superset'],
        ['can_read', 'Database'],
        ['can_approve', 'Superset'],
        ['can_download', 'RowLevelSecurityFiltersModelView'],
        ['can_write', 'Dashboard'],
        ['can_write', 'DashboardPermalinkRestApi'],
        ['can_userinfo', 'UserDBModelView'],
        ['can_list', 'RowLevelSecurityFiltersModelView'],
        ['can_export', 'ImportExportRestApi'],
        ['can_get', 'Datasource'],
        ['can_read', 'Query'],
        ['can_read', 'Explore'],
        ['can_grant_guest_token', 'SecurityRestApi'],
        ['can_add_slices', 'Superset'],
        ['can_write', 'DashboardFilterStateRestApi'],
        ['can_override_role_permissions', 'Superset'],
        ['can_read', 'CssTemplate'],
        ['can_read', 'Annotation'],
        ['can_read', 'Chart'],
        ['can_add', 'RoleModelView'],
        ['menu_access', 'Query Search'],
        ['can_read', 'ExplorePermalinkRestApi'],
        ['can_read', 'ReportSchedule'],
        ['can_sqllab_viz', 'Superset'],
        ['can_explore_json', 'Superset'],
        ['can_write', 'ExploreFormDataRestApi'],
        ['can_write', 'Database'],
        ['can_this_form_get', 'ResetPasswordView'],
        ['can_tagged_objects', 'TagView'],
        ['can_edit', 'RoleModelView'],
        ['menu_access', 'Plugins'],
        ['can_export', 'SavedQuery'],
        ['can_this_form_get', 'ColumnarToDatabaseView'],
        ['can_list', 'AsyncEventsRestApi'],
        ['can_warm_up_cache', 'Superset'],
        ['can_post', 'TagView'],
        ['can_save_dash', 'Superset'],
        ['can_read', 'Dataset'],
        ['can_stop_query', 'Superset'],
        ['can_delete', 'TabStateView'],
        ['can_read', 'Log'],
        ['can_fave_dashboards', 'Superset'],
        ['can_favstar', 'Superset'],
        ['can_read', 'AvailableDomains'],
        ['can_delete', 'TableSchemaView'],
        ['can_save', 'Datasource'],
        ['can_dashboard', 'Superset'],
        ['can_external_metadata', 'Datasource'],
        ['can_write', 'Chart'],
        ['can_get', 'OpenApi'],
        ['can_delete', 'FilterSets'],
        ['can_get', 'MenuApi'],
        ['menu_access', 'Data'],
        ['can_estimate_query_cost', 'Superset'],
        ['can_my_queries', 'SqlLab'],
        ['can_samples', 'Datasource'],
        ['can_read', 'EmbeddedDashboard'],
        ['muldelete', 'RowLevelSecurityFiltersModelView'],
        ['can_store', 'KV'],
        ['can_this_form_post', 'ExcelToDatabaseView'],
        ['can_write', 'DynamicPlugin'],
        ['can_show', 'DynamicPlugin'],
        ['can_duplicate', 'Dataset'],
        ['can_delete', 'DynamicPlugin'],
        ['can_tables', 'Superset'],
        ['can_read', 'Dashboard'],
        ['can_created_slices', 'Superset'],
        ['can_read', 'SavedQuery'],
        ['can_read', 'DashboardPermalinkRestApi'],
        ['can_write', 'Dataset'],
        ['can_add', 'AccessRequestsModelView'],
        ['can_delete', 'RowLevelSecurityFiltersModelView'],
        ['can_write', 'Log'],
        ['can_read', 'DashboardFilterStateRestApi'],
        ['can_this_form_get', 'UserInfoEditView'],
        ['can_query', 'Api'],
        ['menu_access', 'Datasets'],
        ['can_export', 'Chart'],
        ['can_add', 'FilterSets'],
        ['can_write', 'ExplorePermalinkRestApi'],
        ['can_edit', 'UserDBModelView'],
        ['can_sql_json', 'Superset'],
        ['can_read', 'ExploreFormDataRestApi'],
        ['all_datasource_access', 'all_datasource_access'],
        ['can_add', 'DynamicPlugin'],
        ['can_this_form_get', 'ExcelToDatabaseView'],
        ['can_explore', 'Superset'],
        ['can_export', 'Dataset'],
        ['can_add', 'RowLevelSecurityFiltersModelView'],
        ['can_edit', 'DynamicPlugin'],
        ['menu_access', 'Databases'],
        ['can_extra_table_metadata', 'Superset'],
        ['can_delete', 'TagView'],
        ['can_time_range', 'Api'],
        ['can_add', 'UserDBModelView'],
        ['can_show', 'RoleModelView'],
        ['can_edit', 'RowLevelSecurityFiltersModelView'],
        ['can_query_form_data', 'Api'],
      ],
    },
    username: 'nxt.prod',
  };
  bootstrapData.user = result;
  store.dispatch({
    type: USER_LOADED,
    user: result,
  });
  ReactDOM.render(<EmbeddedApp />, appMountPoint);
}

/**
 * Configures SupersetClient with the correct settings for the embedded dashboard page.
 */
function setupGuestClient(guestToken: string) {
  setupClient({
    guestToken,
    guestTokenHeaderName: bootstrapData.config?.GUEST_TOKEN_HEADER_NAME,
    unauthorizedHandler: guestUnauthorizedHandler,
  });
}

function validateMessageEvent(event: MessageEvent) {
  // if (!ALLOW_ORIGINS.includes(event.origin)) {
  //   throw new Error('Message origin is not in the allowed list');
  // }

  if (typeof event.data !== 'object' || event.data.type !== MESSAGE_TYPE) {
    throw new Error(`Message type does not match type used for embedded comms`);
  }
}

window.addEventListener('message', function embeddedPageInitializer(event) {
  try {
    validateMessageEvent(event);
  } catch (err) {
    log('ignoring message unrelated to embedded comms', err, event);
    return;
  }

  const port = event.ports?.[0];
  if (event.data.handshake === 'port transfer' && port) {
    log('message port received', event);

    Switchboard.init({
      port,
      name: 'superset',
      debug: debugMode,
    });

    let started = false;

    Switchboard.defineMethod('guestToken', ({ guestToken }) => {
      setupGuestClient(guestToken);
      if (!started) {
        start();
        started = true;
      }
    });

    Switchboard.defineMethod('getScrollSize', () => ({
      width: document.body.scrollWidth,
      height: document.body.scrollHeight,
    }));

    Switchboard.start();
  }
});

log('embed page is ready to receive messages');
