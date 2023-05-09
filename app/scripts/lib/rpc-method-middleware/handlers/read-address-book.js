import { ethErrors, errorCodes } from 'eth-rpc-errors';
import validUrl from 'valid-url';
import { omit } from 'lodash';
import {
  MESSAGE_TYPE,
  UNKNOWN_TICKER_SYMBOL,
} from '../../../../../shared/constants/app';
import {
  isPrefixedFormattedHexString,
  isSafeChainId,
} from '../../../../../shared/modules/network.utils';
import { MetaMetricsNetworkEventSource } from '../../../../../shared/constants/metametrics';

const addEthereumChain = {
  methodNames: ['wallet_readAddressBook'],
  implementation: addEthereumChainHandler,
  hookNames: {
    readAddressBook: true,
  },
};
export default addEthereumChain;

async function addEthereumChainHandler(
  req,
  res,
  _next,
  end,
  {
    readAddressBook,
  },
) {
  const addressBook = readAddressBook();
  console.log('addressBook')

  return end();
}
