import { TypographyVariant } from '../../../helpers/constants/design-system';

function getValues(pendingApproval, t, actions) {
  // const {
  //   requestData: { content },
  // } = pendingApproval;

  // TODO: add all content and make this work
  return {
    content: [
      {
        element: 'Typography',
        key: 'title',
        children: t('addEthereumChainConfirmationTitle'), // using existing translation as example
        props: {
          variant: TypographyVariant.H3,
          align: 'center',
          fontWeight: 'bold',
          boxProps: {
            margin: [0, 0, 4],
          },
        },
      },
    ],
    submitText: t('ok'),
    onSubmit: () => actions.resolvePendingApproval(pendingApproval.id, null),
  };
}

const addToAddressBook = {
  getValues,
};

export default addToAddressBook;
