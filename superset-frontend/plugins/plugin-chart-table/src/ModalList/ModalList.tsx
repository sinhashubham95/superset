import React from 'react';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';

export interface ModalListProps {
  modalListClassName?: string;
  detail: {
    List: () => JSX.Element | null;
  };
  open: boolean;
  onClose: () => void;
  width?: string | number;
  height?: string | number;
}

export default function ({
  modalListClassName,
  detail,
  width: initialWidth = '100%',
  height: initialHeight = 300,
  open,
  onClose,
}: ModalListProps): JSX.Element {
  return (
    <Modal
      className={modalListClassName}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      closeAfterTransition
    >
      <Fade in={open}>
        <div
          className="modal-list-detail"
          style={{
            minWidth:
              typeof initialWidth === 'number' ? initialWidth / 2 : '50%',
            maxWidth: initialWidth,
            height: initialHeight,
          }}
        >
          <detail.List />
        </div>
      </Fade>
    </Modal>
  );
}
