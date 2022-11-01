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
  ViewerPerformance,
  ViewerStatusbarItemsProvider
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { history } from "./history";
import { ReducerRegistryInstance, StateManager, UiFramework } from "@itwin/appui-react";
import { PropertyGridManager, PropertyGridUiItemsProvider } from "@itwin/property-grid-react";
import { TreeWidget } from "@itwin/tree-widget-react";
import { AppUIProvider } from "./UIProviders/AppUIProvider";
import { SiemensSampleAppReducer } from "./Store/SiemensSampleAppStore";
import { XhqViewsManager, DisplayStylesWidgetProvider, CustomNodeLoadingTreeWidgetProvider } from "@bentley/siemens-itwinui-widgets";
import { ITwinLocalization } from "@itwin/core-i18n";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [contextId, setContextId] = useState(process.env.IMJS_ITWIN_ID); 
  const [changesetId, setChangesetId] = useState(process.env.IMJS_ITWIN_ID); 
  const [xhqBaseURL,setXHQBaseURL] = useState(''); 
  const [hideXhqNavbar,sethideXhqNavbar] = useState('0'); //Value to be passed from url is 1 or 0 
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

  const login = useCallback(async () => {
    try {
      await publicAuthClient.signIn();
      // await privateAuthClient.signIn();
    } catch {
      await publicAuthClient.signOut();
      // await privateAuthClient.signOut();
    }
  }, [privateAuthClient,publicAuthClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    setContextId(getURLParameterValue("contextId".toLocaleLowerCase()) || getURLParameterValue("projectId".toLocaleLowerCase()));
    setIModelId(getURLParameterValue("iModelId".toLocaleLowerCase()));
    setChangesetId(getURLParameterValue("changesetId".toLocaleLowerCase()));
    setXHQBaseURL(getURLParameterValue(("xhqbaseurl").toLocaleLowerCase()));
    sethideXhqNavbar(getURLParameterValue(("hideXhqNavbar").toLocaleLowerCase()));
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
     if(xhqBaseURL)
      urlHistory = `${urlHistory}&xhqbaseurl=${xhqBaseURL}`    
     if(hideXhqNavbar)
      urlHistory = `${urlHistory}&hideXhqNavbar=${hideXhqNavbar}`
     history.push(urlHistory);
    }
  }, [accessToken, contextId, iModelId, changesetId,xhqBaseURL,hideXhqNavbar]);
  
  const onIModelConnected = useCallback(async (iModel: IModelConnection) => {
    UiFramework.setIModelConnection(iModel, true);
    await XhqViewsManager.initialize(IModelApp.localization as ITwinLocalization,iModel);
  },[]);
  
  const onIModelAppInit = useCallback(async () => {
    await UiFramework.initialize(StateManager.store, undefined);
    ReducerRegistryInstance.registerReducer(
      "SiemensSampleApp",
      SiemensSampleAppReducer
    );
    await TreeWidget.initialize();
    await PropertyGridManager.initialize();
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
          new AppUIProvider({
            XhqOptions:{
              xhqBaseUrl:xhqBaseURL,
              hideXhqNavbar: (hideXhqNavbar === '0')? false : true
            }
          }),
          new PropertyGridUiItemsProvider({
            enableCopyingPropertyText: true,
          }),
          new ViewerNavigationToolsProvider(),
          new ViewerContentToolsProvider({
            vertical: {
              measureGroup: false,
            },
          }),
          new ViewerStatusbarItemsProvider({
            accuSnapModePicker: true,
            messageCenter: true,
            postToolAssistanceSeparator: true,
            preToolAssistanceSeparator: true,
            selectionInfo: true,
            selectionScope: true,
            tileLoadIndicator: true,
            toolAssistance: true
          }),
          new DisplayStylesWidgetProvider()
        ]}
        backend={{ hostedBackend: undefined }}
      />
    </div>
  );
};

export default App;
