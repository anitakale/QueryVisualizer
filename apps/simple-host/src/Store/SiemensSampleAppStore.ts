// Copyright (c) Bentley Systems
import { ActionsUnion, createAction, DeepReadonly } from "@itwin/appui-react";

export interface SiemensSampleAppState {
    isXhqViewsDialogOpen: boolean;
}
const initialState: SiemensSampleAppState = {
   isXhqViewsDialogOpen:false
};
// tslint:disable-next-line:variable-name
export const SiemensSampleAppActions = {
    setIsXhqViewsDialogOpen: (isOpen: boolean) => createAction("SiemensSampleApp:SET_XHQ_VIEWS_DIALOG_OPEN", isOpen),
    clearIsXhqViewsDialogOpen: () => createAction("SiemensSampleApp:CLEAR_XHQ_VIEWS_DIALOG_OPEN"),
};

export type SiemensSampleAppActionUnion = ActionsUnion<typeof SiemensSampleAppActions>;

export function SiemensSampleAppReducer(state: SiemensSampleAppState = initialState, action: SiemensSampleAppActionUnion): DeepReadonly<SiemensSampleAppState> {
  switch (action.type) {
    case "SiemensSampleApp:SET_XHQ_VIEWS_DIALOG_OPEN":
      return { ...state, isXhqViewsDialogOpen: action.payload };
  }
  return state;
}