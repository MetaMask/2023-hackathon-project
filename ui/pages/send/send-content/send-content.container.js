import { connect } from 'react-redux';
import {
  getIsEthGasPriceFetched,
  getNoGasPriceFetched,
  checkNetworkOrAccountNotSupports1559,
  getIsMultiLayerFeeNetwork,
} from '../../../selectors';
import {
  getIsBalanceInsufficient,
  getSendAsset,
  getAssetError,
  getRecipient,
  acknowledgeRecipientWarning,
  getRecipientWarningAcknowledgement,
  getSendErrors,
} from '../../../ducks/send';
import SendContent from './send-content.component';

function mapStateToProps(state) {
  const recipient = getRecipient(state);
  const recipientWarningAcknowledged =
    getRecipientWarningAcknowledgement(state);
  const sendErrors = getSendErrors(state);
  const recipientError = sendErrors.recipient;

  return {
    isEthGasPrice: getIsEthGasPriceFetched(state),
    noGasPrice: getNoGasPriceFetched(state),
    networkOrAccountNotSupports1559:
      checkNetworkOrAccountNotSupports1559(state),
    getIsBalanceInsufficient: getIsBalanceInsufficient(state),
    asset: getSendAsset(state),
    assetError: getAssetError(state),
    recipient,
    recipientWarningAcknowledged,
    isMultiLayerFeeNetwork: getIsMultiLayerFeeNetwork(state),
    error: recipientError,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    acknowledgeRecipientWarning: () => dispatch(acknowledgeRecipientWarning()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendContent);
