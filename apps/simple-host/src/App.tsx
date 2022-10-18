/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./App.scss";

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { FitViewTool, IModelApp, IModelConnection, ScreenViewport, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import {
  useAccessToken,
  Viewer,
  ViewerContentToolsProvider,
  ViewerNavigationToolsProvider,
  ViewerPerformance
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { history } from "./history";
import { ReducerRegistryInstance, StateManager, UiFramework } from "@itwin/appui-react";
import { PropertyGridManager, PropertyGridUiItemsProvider } from "@itwin/property-grid-react";
import { TreeWidget } from "@itwin/tree-widget-react";
import { AppUIProvider } from "./UIProviders/AppUIProvider";
import { SiemensSampleAppReducer } from "./Store/SiemensSampleAppStore";
import { XhqViewsManager } from "@bentley/siemens-itwinui-widgets";
import { ITwinLocalization } from "@itwin/core-i18n";
import { ISVCommonUtilitiesManager } from "@bentley/isv-common-utilities";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [contextId, setContextId] = useState(process.env.IMJS_ITWIN_ID); 
  const [changesetId, setChangesetId] = useState(process.env.IMJS_ITWIN_ID); 
  const accessToken = useAccessToken();

  const publicAuthClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        scope: process.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
        clientId: process.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
        redirectUri: process.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
        postSignoutRedirectUri: process.env.IMJS_AUTH_CLIENT_LOGOUT_URI,
        responseType: "code",
        authority: process.env.IMJS_AUTH_AUTHORITY_PUBLIC,
      }),
    []
  );

  const privateAuthClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        scope: process.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
        clientId: process.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
        redirectUri: process.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
        postSignoutRedirectUri: process.env.IMJS_AUTH_CLIENT_LOGOUT_URI,
        responseType: "code",
        authority: process.env.IMJS_AUTH_AUTHORITY_PRIVATE,
      }),
    []
  );

  const caseSensitiveUrlParms = new URLSearchParams(window.location.search); 
  const urlParams = new URLSearchParams();
  for (const [name, value] of caseSensitiveUrlParms) {
    urlParams.append(name.toLowerCase(), value);
  }

  function getURLParameterValue(parameterKey:string): string { 
    if(urlParams.has(parameterKey)){
      return urlParams.get(parameterKey) as string;
    }
    return "";
  }

  const getPublicAccessToken = useCallback(async () => {
    console.log("Inside getPrivateAccessToken");
    return Promise.resolve(await publicAuthClient.getAccessToken() ?? "");
  }, [publicAuthClient]);


  const getPrivateAccessToken = useCallback(async () => {
    console.log("Inside getPublicAccessToken");
    return Promise.resolve(await privateAuthClient.getAccessToken() ?? "");
  }, [privateAuthClient]);

  const login = useCallback(async () => {
    try {
      await publicAuthClient.signIn();
      await privateAuthClient.signIn();
    } catch {
      await publicAuthClient.signOut();
      await privateAuthClient.signOut();
    }
  }, [privateAuthClient,publicAuthClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    setContextId(getURLParameterValue("contextId".toLocaleLowerCase()) || getURLParameterValue("projectId".toLocaleLowerCase()));
    setIModelId(getURLParameterValue("iModelId".toLocaleLowerCase()));
    setChangesetId(getURLParameterValue("changesetId".toLocaleLowerCase()))
}, []);

  useEffect(() => {
    let urlHistory = `?`
    if (accessToken) {
     if(contextId)
      urlHistory = `${urlHistory}contextId=${contextId}`
     if(iModelId)
      urlHistory =`${urlHistory}&iModelId=${iModelId}`
     if(changesetId)
      urlHistory = `${urlHistory}&changesetId=${changesetId}`     
     history.push(urlHistory);
    }
  }, [accessToken, contextId, iModelId, changesetId]);
  
  const onIModelConnected = useCallback(async (iModel: IModelConnection) => {
    UiFramework.setIModelConnection(iModel, true);
  },[]);
  
  const onIModelAppInit = useCallback(async () => {
    await UiFramework.initialize(StateManager.store, undefined);
    ReducerRegistryInstance.registerReducer(
      "SiemensSampleApp",
      SiemensSampleAppReducer
    );
    await TreeWidget.initialize();
    await PropertyGridManager.initialize();
    await XhqViewsManager.initialize(IModelApp.localization as ITwinLocalization);
  },[])

  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            void ViewerPerformance.addMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded"
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={contextId ?? ""}
        iModelId={iModelId ?? ""}
        changeSetId={changesetId}
        authClient={publicAuthClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
        onIModelAppInit={onIModelAppInit}
        onIModelConnected={onIModelConnected}
        uiProviders={[
          new AppUIProvider(),
          new PropertyGridUiItemsProvider({
            enableCopyingPropertyText: true,
          }),
          new ViewerNavigationToolsProvider(),
          new ViewerContentToolsProvider({
            vertical: {
              measureGroup: false,
            },
          }),
        ]}
        backend={{ hostedBackend: undefined }}
      />
    </div>
  );
};

export default App;
