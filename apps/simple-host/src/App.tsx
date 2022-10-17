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
import { StateManager, UiFramework } from "@itwin/appui-react";
import { ExternalDataUIManager, ExternalDataUIProvider, IPredefinedLink } from "@bentley/spg-external-data-ui";
import { PropertyGridManager, PropertyGridUiItemsProvider } from "@itwin/property-grid-react";
import { TreeWidget } from "@itwin/tree-widget-react";


const externalLink_WikipediaByElementCode: IPredefinedLink = {
  caption: "Wikipedia By Element Code",
  enabled: true,
  index: 1,
  url: "https://en.wikipedia.org/wiki/{elementCodeValue}"
}
const externalLink_WikipediaByFederatedGuid: IPredefinedLink = {
  caption: "Wikipedia By Federated Guid",
  enabled: true,
  index: 2,
  url: "https://en.wikipedia.org/wiki/{elementFedGuid}"
}
const externalLink_WikipediaOrg: IPredefinedLink = {
  caption: "Wikipedia Org",
  enabled: true,
  index: 3,
  url: "https://www.wikipedia.org/"
}

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [contextId, setContextId] = useState(process.env.IMJS_ITWIN_ID); 
  const [changesetId, setChangesetId] = useState(process.env.IMJS_ITWIN_ID); 
  const [externalDataSourceType,setExternalDataSourceType] = useState('');
  const [externalDataPath,setExternalDataPath] = useState('');
  const [synchSchemaType, setSynchSchemaType] = useState('');
  const [synchFieldType, setSynchFieldType] = useState('');
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

  const authPublic = useRef({
    getAccessToken: getPublicAccessToken,
  });

  const getPrivateAccessToken = useCallback(async () => {
    console.log("Inside getPublicAccessToken");
    return Promise.resolve(await privateAuthClient.getAccessToken() ?? "");
  }, [privateAuthClient]);
  const authPrivate = useRef({
    getAccessToken: getPrivateAccessToken,
  });

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
    setExternalDataPath(getURLParameterValue("externalDataPath".toLocaleLowerCase()));
    setExternalDataSourceType(getURLParameterValue("externalDataSourceType".toLocaleLowerCase()));
    setChangesetId(getURLParameterValue("changesetId".toLocaleLowerCase()))
    setSynchSchemaType(getURLParameterValue("synchSchemaType".toLocaleLowerCase()));
    setSynchFieldType(getURLParameterValue("synchFieldType".toLocaleLowerCase()));
}, []);

  useEffect(() => {
    let urlHistory = `?`
    if (accessToken) {
     if(contextId)
      urlHistory = `${urlHistory}contextId=${contextId}`
     if(iModelId)
      urlHistory =`${urlHistory}&iModelId=${iModelId}`
     if(externalDataSourceType)
      urlHistory =  `${urlHistory}&externalDataSourceType=${externalDataSourceType}`
     if(externalDataPath)
      urlHistory =  `${urlHistory}&externalDataPath=${externalDataPath}`
     if(changesetId)
      urlHistory =  `${urlHistory}&changesetId=${changesetId}`
     if (synchSchemaType)
      urlHistory = `${urlHistory}&synchSchemaType=${synchSchemaType}`;
     if (synchFieldType)
      urlHistory = `${urlHistory}&synchFieldType=${synchFieldType}`;
     
     history.push(urlHistory);
    }
  }, [accessToken, contextId, iModelId, externalDataSourceType, externalDataPath, changesetId, synchFieldType, synchSchemaType]);
  
  const onIModelConnected = useCallback((iModel: IModelConnection) => {
    UiFramework.setIModelConnection(iModel, true);
    ExternalDataUIManager.initialize(
        UiFramework.store,
        IModelApp.localization,
        {
          useDataProviderInfrastructureForPredefinedLinks: false,
          accessToken: {
            publicAccessToken: authPublic.current.getAccessToken,
            privateAccessToken: authPrivate.current.getAccessToken,
          },
          externalDataProviderName: externalDataSourceType,
          externalDataPath: externalDataPath,
          predefinedLinksByType: {
            embeddedLinks: {
              WikiByCode: externalLink_WikipediaByElementCode,
              WikiByFedGuid: externalLink_WikipediaByFederatedGuid,
              WikiOrg: externalLink_WikipediaOrg,
            },
            externalLinks: {
              WikiByCode: externalLink_WikipediaByElementCode,
              WikiByFedGuid: externalLink_WikipediaByFederatedGuid,
              WikiOrg: externalLink_WikipediaOrg,
            },
          },
          syncOptions: {
            SynchSchemaType: synchSchemaType,
            SynchFieldType: synchFieldType
          }
        }
      );
  },[externalDataPath, externalDataSourceType, synchFieldType, synchSchemaType]);
  
  const onIModelAppInit = useCallback(async () => {
    await UiFramework.initialize(StateManager.store, undefined);
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
          new ExternalDataUIProvider(),
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
