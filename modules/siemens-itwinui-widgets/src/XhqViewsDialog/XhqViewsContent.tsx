// Copyright (c) Bentley Systems
import React, { useEffect, useState } from "react";
import "./XhqViewsContent.scss";
import { IXhqOptions } from "../XhqViewsDialog/interfaces";
import { XhqViewsUtilities } from "./XhqViewsUtilities";
import { XHQNavigationLink } from "./XHQNavigationLink";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@itwin/presentation-frontend";
import { Utilities } from "@bentley/spg-external-data-providers";

export interface XhqViewsContentProps {
  XhqOptions : IXhqOptions;
}
export const XhqViewsContent = (props: XhqViewsContentProps) => {
  const [xhqLink, setxhqLink] = useState("");
  const [elementSelectedId,setElementSelectedId] = useState<string>();

  useEffect(()=>{
    const handleSyncUiEvent = (evt: SelectionChangeEventArgs,selectionProvider: ISelectionProvider) => {
      if(evt.imodel){
        const idset = selectionProvider.getSelection(evt.imodel, evt.level);
        const selectedElements = XhqViewsUtilities.getIds(idset);
        const ids = [...selectedElements];
        if(selectedElements && selectedElements.size > 0){
          setElementSelectedId(ids[0])
        }
        else{
          setElementSelectedId(undefined)
        }
      }
    }
    Presentation.selection.selectionChange.addListener(handleSyncUiEvent);
  },[])
 
  useEffect(()=>{
  let xhqTemplateUrl:string;
  if(elementSelectedId){
    xhqTemplateUrl = `${props.XhqOptions.xhqBaseUrl}/indx/sv/?hideNavBar=${props.XhqOptions.hideXhqNavbar?1:0}&ps-contextid={ContextId}&useOidc=true#::PlantSight/Assets/{elementCodeValue}/~Detail`;
  }
  else{
    xhqTemplateUrl = `${props.XhqOptions.xhqBaseUrl}/indx/sv/?ps-context={ContextId}&useOidc=true`;
  }

  Utilities.replaceContextualTokens(xhqTemplateUrl).then((resolvedXhqLink)=>{
    setxhqLink(resolvedXhqLink);
  })
  
  },[elementSelectedId])

  const isXhqViewSelected = (xhqResolvedLink:string): boolean => {
    if (
      xhqResolvedLink && elementSelectedId
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className={"divWrapper"}>
      {isXhqViewSelected(xhqLink) && <XHQNavigationLink onConfirmNavigate={props.XhqOptions.onClickNavigate}/>}
      {Utilities.isUrlResolved(xhqLink) && (
        <iframe
          title="OperIntl View"
          className={"XhqLinksiFrame"}
          frameBorder={0}
          src={xhqLink}
        />
      )}
    </div>
  );
};
