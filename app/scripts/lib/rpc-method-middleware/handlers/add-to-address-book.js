import { ethErrors, errorCodes } from 'eth-rpc-errors';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';
import {
  isPrefixedFormattedHexString,
  isSafeChainId,
} from '../../../../../shared/modules/network.utils';

const addToAddressBook = {
  methodNames: [MESSAGE_TYPE.ADD_TO_ADDRESS_BOOK],
  implementation: addToAddressBookHandler,
  hookNames: {
    addToAddressBook: true,
    requestUserApproval: true,
  },
};
export default addToAddressBook;

// TODO: make this work for multiple addresses
async function addToAddressBookHandler(
  req,
  _,
  _next,
  end,
  { requestUserApproval, addToAddressBook: _addToAddressBook },
) {
  if (!req.params || typeof req.params !== 'object') {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected single, object parameter. Received:\n${JSON.stringify(
          req.params,
        )}`,
      }),
    );
  }

  const { origin } = req;

  const {
    address,
    name,
    chainId = '0x1',
    memo = '',
    addressType,
    tags = [],
    source = '',
  } = req.params;

  const _chainId = typeof chainId === 'string' && chainId.toLowerCase();

  if (!isPrefixedFormattedHexString(_chainId)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected 0x-prefixed, unpadded, non-zero hexadecimal string 'chainId'. Received:\n${chainId}`,
      }),
    );
  }

  if (!isSafeChainId(parseInt(_chainId, 16))) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Invalid chain ID "${_chainId}": numerical value greater than max safe value. Received:\n${chainId}`,
      }),
    );
  }

  // Ask the user to confirm adding a contact to the address book
  try {
    await requestUserApproval({
      origin,
      type: MESSAGE_TYPE.ADD_TO_ADDRESS_BOOK,
      requestData: {
        address,
        name,
        chainId,
        memo,
        addressType,
        tags,
        source,
      },
    });
    await addToAddressBook(
      address,
      name,
      chainId,
      memo,
      addressType,
      tags,
      source,
    );
  } catch (error) {
    // For the purposes of this method, it does not matter if the user
    // declines to add a contact. However, other errors indicate
    // that something is wrong.
    if (error.code !== errorCodes.provider.userRejectedRequest) {
      return end(error);
    }
  }
  return end();
}
