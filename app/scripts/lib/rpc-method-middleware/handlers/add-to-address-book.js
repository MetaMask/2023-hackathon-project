import { ethErrors, errorCodes } from 'eth-rpc-errors';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

const addToAddressBook = {
  methodNames: [MESSAGE_TYPE.ADD_TO_ADDRESS_BOOK],
  implementation: addToAddressBookHandler,
  hookNames: { requestUserApproval: true },
};
export default addToAddressBook;

async function addToAddressBookHandler(
  req,
  res,
  _next,
  end,
  { requestUserApproval },
) {
  if (!req.params || typeof req.params !== 'object') {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Unexpected parameters:\n${JSON.stringify(req.params)}`,
      }),
    );
  }

  const { origin } = req;
  const isBulkRequest = Array.isArray(req.params);

  try {
    const requestUserApprovalResult = await requestUserApproval({
      origin,
      type: MESSAGE_TYPE.ADD_TO_ADDRESS_BOOK,
      requestData: {
        data: req.params,
        source: origin,
        isBulkRequest,
      },
    });
    await requestUserApprovalResult.result;
    res.result = true;
    return end();
  } catch (error) {
    // For the purposes of this method, it does not matter if the user
    // declines to add to address book. However, other errors indicate
    // that something is wrong.
    if (error.code !== errorCodes.provider.userRejectedRequest) {
      return end(error);
    }
    return end();
  }
}
