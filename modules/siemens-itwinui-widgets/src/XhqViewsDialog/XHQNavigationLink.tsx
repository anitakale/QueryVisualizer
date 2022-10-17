// Copyright (c) Bentley Systems
import { Button, Modal, ModalButtonBar, ModalContent } from "@itwin/itwinui-react";
import React, { useState } from "react";
import { XhqViewsManager } from "../XhqViewsManager";
import "./XHQNavigationLink.scss";
export interface XhqNavigationLinkProps {
  onConfirmNavigate?: (args: any) => void
  }
export const XHQNavigationLink = (props: XhqNavigationLinkProps) => {
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const loadConfirmNavigationModal = (): void => {
      setIsConfirmationModalOpen(true);
    };

    const getNavigationTitle = (): string => {
        return XhqViewsManager.translate(
          "operIntlNavigation.navigateToLinkTitle"
        );
      };

    const onClose = (_event?: React.SyntheticEvent<Element, Event>) => {
      setIsConfirmationModalOpen(false);    
    };

    const confirmButtonHandle = (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
       ) => {
        if(props.onConfirmNavigate)
        props.onConfirmNavigate([]);
      };
      
      const cancelButtonHandle = (
        _event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
       ) => {
        setIsConfirmationModalOpen(false); 
      };

return (
  <>
    <span className="xhq-link link" onClick={loadConfirmNavigationModal}>
      {getNavigationTitle()}
    </span>
    <Modal
      className="xhq-modal"
      isOpen={isConfirmationModalOpen}
      title={XhqViewsManager.translate(
        "operIntlNavigation.confirmationModal.title"
      )}
      onClose={onClose}
    >
      <ModalContent>
        <span>
          {XhqViewsManager.translate(
            "operIntlNavigation.confirmationModal.warning"
          )}
        </span>
        <p>
          {XhqViewsManager.translate(
            "operIntlNavigation.confirmationModal.confirmationMessage"
          )}
        </p>
      </ModalContent>
      <ModalButtonBar>
        <Button styleType="high-visibility" onClick={confirmButtonHandle}>
          {XhqViewsManager.translate(
            "operIntlNavigation.confirmationModal.confirm"
          )}
        </Button>
        <Button onClick={cancelButtonHandle}>
          {XhqViewsManager.translate(
            "operIntlNavigation.confirmationModal.cancel"
          )}
        </Button>
      </ModalButtonBar>
    </Modal>
  </>
);
}

