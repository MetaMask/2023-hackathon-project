import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Box from '../../ui/box';
import Button from '../../ui/button';
import Typography from '../../ui/typography/typography';
import NftsDetectionNotice from '../nfts-detection-notice';
import NftsItems from '../nfts-items';
import {
  TypographyVariant,
  TEXT_ALIGN,
  JustifyContent,
  FLEX_DIRECTION,
  FONT_WEIGHT,
  AlignItems,
  TextColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getIsMainnet, getUseNftDetection, getSelectedAddress } from '../../../selectors';
import { EXPERIMENTAL_ROUTE } from '../../../helpers/constants/routes';
import {
  checkAndUpdateAllNftsOwnershipStatus,
  detectNfts,
} from '../../../store/actions';
import { useNftsCollections } from '../../../hooks/useNftsCollections';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import METAFOXIES_ABI from '../../../pages/meta-foxies/metafoxies-abi.js'
import foxColors from '../../../pages/meta-foxies/fox-colors'

const hexToRGB = function (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
    ]
   : null;
}

const hexColorsToRGB = colors => colors.map(color => hexToRGB(color))

const uint256ToColors = function (uint256) {
  const intsForColors = uint256.slice(0,30)
  const colors = intsForColors.match(/.{1,3}/g)
    .map(n => foxColors[Number(n) - 100])
  return hexColorsToRGB(colors)
}

export default function NftsTab({ onAddNFT }) {
  const useNftDetection = useSelector(getUseNftDetection);
  const isMainnet = useSelector(getIsMainnet);
  const selectedAddress = useSelector(getSelectedAddress);
  const history = useHistory();
  const t = useI18nContext();
  const dispatch = useDispatch();

  const [ethContract] = useState(() => global.eth.contract(METAFOXIES_ABI).at('0xC36063ECfCd6D5C8b5CabEBef937E4b9EBd55726'))
  const [foxCollection, setFoxCollection] = useState({});

  useEffect(() => {
    ethContract.balanceOf(selectedAddress, (error, result1) => {
      if (error) {
        throw error
      }
      const numberOfFoxes = result1[0].toNumber()
      const promises = []
      for(let i = 0;i < numberOfFoxes; i++) {
        promises.push(new Promise((resolve,reject) => {
          console.log('$$$ selectedAddress', selectedAddress)
          console.log('$$$ i', i)
          ethContract.tokenOfOwnerByIndex(selectedAddress, i, (error, result2) => {
            if (error) {
              return reject(error)
            }
            console.log('result2', result2)
            resolve(result2)
        })}))
      }
      Promise.all(promises)
        .then(results => {
          console.log('$$$ results 2', results)
          const foxNFTs = results.map(result => ({
            tokenId: result[0].toString(10),
            foxColors: uint256ToColors(result[0].toString(10))
          }));
          const _collection = {
            collectionName: 'SecurityFox',
            // collectionImage: collectionContract?.logo || nft.image,
            nfts: foxNFTs,
          };
          setFoxCollection(_collection)
        })

    })
  }, [])

  const { nftsLoading, collections, previouslyOwnedCollection } =
    useNftsCollections();

  const onEnableAutoDetect = () => {
    history.push(EXPERIMENTAL_ROUTE);
  };

  const onRefresh = () => {
    if (isMainnet) {
      dispatch(detectNfts());
    }
    checkAndUpdateAllNftsOwnershipStatus();
  };

  if (nftsLoading) {
    return <div className="nfts-tab__loading">{t('loadingNFTs')}</div>;
  }

  if (foxCollection?.nfts?.length) {
    collections['0xC36063ECfCd6D5C8b5CabEBef937E4b9EBd55726'] =  foxCollection
  }

  return (
    <Box className="nfts-tab">
      {Object.keys(collections).length > 0 ||
      previouslyOwnedCollection.nfts.length > 0 ? (
        <NftsItems
          collections={collections}
          previouslyOwnedCollection={previouslyOwnedCollection}
        />
      ) : (
        <>
          {isMainnet && !useNftDetection ? <NftsDetectionNotice /> : null}
          <Box padding={12}>
            <Box justifyContent={JustifyContent.center}>
              <img src="./images/no-nfts.svg" />
            </Box>
            <Box
              marginTop={4}
              marginBottom={12}
              justifyContent={JustifyContent.center}
              flexDirection={FLEX_DIRECTION.COLUMN}
              className="nfts-tab__link"
            >
              <Typography
                color={TextColor.textMuted}
                variant={TypographyVariant.H4}
                align={TEXT_ALIGN.CENTER}
                fontWeight={FONT_WEIGHT.BOLD}
              >
                {t('noNFTs')}
              </Typography>
              <Button
                type="link"
                target="_blank"
                rel="noopener noreferrer"
                href={ZENDESK_URLS.NFT_TOKENS}
              >
                {t('learnMoreUpperCase')}
              </Button>
            </Box>
          </Box>
        </>
      )}
      <Box
        marginBottom={4}
        justifyContent={JustifyContent.center}
        flexDirection={FLEX_DIRECTION.COLUMN}
      >
        <Typography
          color={TextColor.textMuted}
          variant={TypographyVariant.H5}
          align={TEXT_ALIGN.CENTER}
        >
          {t('missingNFT')}
        </Typography>
        <Box
          alignItems={AlignItems.center}
          justifyContent={JustifyContent.center}
        >
          {!isMainnet && Object.keys(collections).length < 1 ? null : (
            <>
              <Box
                className="nfts-tab__link"
                justifyContent={JustifyContent.flexEnd}
              >
                {isMainnet && !useNftDetection ? (
                  <Button type="link" onClick={onEnableAutoDetect}>
                    {t('enableAutoDetect')}
                  </Button>
                ) : (
                  <Button type="link" onClick={onRefresh}>
                    {t('refreshList')}
                  </Button>
                )}
              </Box>
              <Typography
                color={TextColor.textMuted}
                variant={TypographyVariant.H6}
                align={TEXT_ALIGN.CENTER}
              >
                {t('or')}
              </Typography>
            </>
          )}
          <Box
            justifyContent={JustifyContent.flexStart}
            className="nfts-tab__link"
          >
            <Button type="link" onClick={onAddNFT}>
              {t('importNFTs')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

NftsTab.propTypes = {
  onAddNFT: PropTypes.func.isRequired,
};
