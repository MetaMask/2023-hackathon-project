import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import {
  fillInFoxColor,
  FOX_COLOR_PALETTE,
  generateColorPurelyOnAddress,
  generateColorsFromAI,
} from '../../../helpers/utils/generative-color';
import Mascot from '../../../components/ui/mascot';

import { PREDEFINED_COLOR_PALETTES } from '../../../helpers/constants/color-palette';
import useDidMountEffect from '../../../helpers/utils/useDidMountEffect';
import { baseFoxJson } from './BaseFoxJson';

export const COLOR_PALETTE_TYPE = {
  generative: 'generative',
  ai: 'ai',
  editorSelection: 'editorSelection',
  previousSelected: 'previousSelected',
  default: 'default',
};

const applyColoursToFoxJson = (colourArray) => {
  const chunks = baseFoxJson.chunks.map((chunk, i) => ({
    ...chunk,
    color: colourArray[i],
  }));
  return {
    ...baseFoxJson,
    chunks,
  };
};

const FoxIcon = ({
  size = 240,
  address,
  colorPaletteType,
  editorSelection = null,
  settledColorSchema,
  handleNewColorSettled,
  shouldShuffle,
  svgRef,
  followMouse = false,
  manualColorSchema,
}) => {
  const [colorSchema, setColorSchema] = useState(
    settledColorSchema || fillInFoxColor(generateColorPurelyOnAddress(address)),
  );
  const [eventEmitter] = useState(new EventEmitter());
  // doesnt run when component is loaded
  useDidMountEffect(() => {
    switch (colorPaletteType) {
      case COLOR_PALETTE_TYPE.generative:
        setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
        break;
      case COLOR_PALETTE_TYPE.ai:
        async function fetchAISchema() {
          const colorsFromAI = await generateColorsFromAI(
            address,
            shouldShuffle,
          );
          setColorSchema(fillInFoxColor(colorsFromAI));
        }

        fetchAISchema();
        break;
      case COLOR_PALETTE_TYPE.editorSelection:
        setColorSchema(
          fillInFoxColor(PREDEFINED_COLOR_PALETTES[editorSelection - 1]),
        );
        break;
      case COLOR_PALETTE_TYPE.previousSelected:
        if (settledColorSchema) {
          setColorSchema(settledColorSchema);
        }
        break;
      case COLOR_PALETTE_TYPE.default:
        setColorSchema(Object.values(FOX_COLOR_PALETTE));
        break;
      case 'manualMint':
        setColorSchema(manualColorSchema);
      default:
        setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
        break;
    }
  }, [address, colorPaletteType, editorSelection]);

  useEffect(() => {
    if (handleNewColorSettled) {
      handleNewColorSettled(colorSchema);
    }
  }, [colorSchema, handleNewColorSettled]);

  useEffect(() => {
    if (!colorPaletteType) {
      setColorSchema(settledColorSchema);
    }
  }, [colorPaletteType, settledColorSchema]);

  // shuffle flagggg
  useEffect(() => {
    if (colorPaletteType === COLOR_PALETTE_TYPE.generative) {
      setColorSchema(fillInFoxColor(generateColorPurelyOnAddress(address)));
    } else if (colorPaletteType === COLOR_PALETTE_TYPE.ai) {
      async function fetchAISchema() {
        const colorsFromAI = await generateColorsFromAI(address);
        setColorSchema(fillInFoxColor(colorsFromAI));
      }
      fetchAISchema();
    }
  }, [shouldShuffle]);

  const selectColorSchema = colorPaletteType === 'manualMint'
    ? manualColorSchema
    : colorSchema

  return (
    <div ref={svgRef}>
      <Mascot
        animationEventEmitter={eventEmitter}
        width={String(size)}
        height={String(size)}
        meshJson={
          colorPaletteType === COLOR_PALETTE_TYPE.default
            ? baseFoxJson
            : applyColoursToFoxJson(selectColorSchema)
        }
        followMouse={followMouse}
      />
    </div>
  );
};

FoxIcon.propTypes = {
  size: PropTypes.number,
  address: PropTypes.string,
  svgRef: PropTypes.object,
  colorPaletteType: PropTypes.string,
  editorSelection: PropTypes.number,
  settledColorSchema: PropTypes.array,
  handleNewColorSettled: PropTypes.func,
  shouldShuffle: PropTypes.bool,
  followMouse: PropTypes.bool,
};

export default FoxIcon;
