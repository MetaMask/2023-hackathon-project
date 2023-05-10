import PropTypes from 'prop-types';
import React from 'react';
import {
  FontWeight,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import withModalProps from '../../../../helpers/higher-order-components/with-modal-props';
import { Text } from '../../../component-library';
import Modal from '../../modal';

const ConfirmClearContactList = ({ clearContactList, hideModal }) => {
  return (
    <Modal
      onSubmit={() => {
        clearContactList();
        hideModal();
      }}
      submitText="Clear contact list"
      onCancel={() => hideModal()}
      cancelText="Cancel"
      contentClass="customize-nonce-modal-content"
      containerClass="customize-nonce-modal-container"
    >
      <Text variant={TextVariant.bodySm} as="h6" fontWeight={FontWeight.Normal}>
        Very cool explanatory text
      </Text>
    </Modal>
  );
};

ConfirmClearContactList.propTypes = {
  hideModal: PropTypes.func.isRequired,
  clearContactList: PropTypes.func,
};

export default withModalProps(ConfirmClearContactList);
