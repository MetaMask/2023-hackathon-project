import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import TextField from '../../components/ui/text-field'
import { EventEmitter } from 'events'
import Mascot from '../../components/ui/mascot'
import { baseFoxJson } from '../../components/ui/fox-icon/BaseFoxJson.js'
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import METAFOXIES_ABI from './metafoxies-abi.js'
import foxColors from './fox-colors'
import { GithubPicker } from 'react-color';
import BigNumber from 'bignumber.js'
import ErrorMessage from '../../components/ui/error-message'

const rgbToHex = function (rgb) { 
  let hex = Number(rgb).toString(16);
  if (hex.length < 2) {
      hex = "0" + hex;
  }
  return hex;
};

const fullColorHex = function(r,g,b) {   
  const red = rgbToHex(r);
  const green = rgbToHex(g);
  const blue = rgbToHex(b);
  return '#'+red+green+blue;
};



const hexToRGB = function (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
    ]
   : null;
}

const toRGBObject = function (hex) {
  const [r,g,b] = hexToRGB(hex)
  console.log('r,g,b', r,g,b)
  return { r, g, b }
}

const colorsToTokenID = function (colors) {
  console.log('^^foxColors', foxColors)
  console.log('^^colors', colors)
  return colors
    .map(color => foxColors.findIndex(foxColor => foxColor.toLowerCase() === color.toLowerCase()))
    .map(arrayIndex => arrayIndex + 100)
    .join('')
}

const uint256ToColors = function (uint256) {
  const intsForColors = uint256.slice(0,30)
  const colors = intsForColors.match(/.{1,3}/g)
    .map(n => foxColors[Number(n) - 100])
  return colors
}

const generateRandomColors = function () {
  const colors = []
  for(let i = 0;i < 10;i++) {
    colors.push(foxColors[Math.floor(Math.random() * 140)])
  }
  return colors
}

const hexColorsToRGB = colors => colors.map(color => hexToRGB(color))

const defaultColors = Object.entries(baseFoxJson.chunks).map(([key, {color}]) => fullColorHex(...color))
export default class UnlockPage extends Component {
  static contextTypes = {
    metricsEvent: PropTypes.func,
    t: PropTypes.func,
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    isUnlocked: PropTypes.bool,
    onImport: PropTypes.func,
    onRestore: PropTypes.func,
    onSubmit: PropTypes.func,
    forceUpdateMetamaskState: PropTypes.func,
    showOptInModal: PropTypes.func,
  }

  submitting = false

  animationEventEmitter = new EventEmitter()

  setFoxColorSchema (colors) {
    this.props.setFoxColorSchema(hexColorsToRGB(colors))
  }

  UNSAFE_componentWillMount () {
    const { selectedAddress } = this.props

    this.ethContract = global.eth.contract(METAFOXIES_ABI).at('0xd929b2e151a1f41114c95b7e05fa670c654d099e')
    this.setState({
      colors: defaultColors,
      currentFox: {},
      mode: 'CREATE',
      metafoxies: [],
      numberOfFoxes: null,
    })
    this.setFoxColorSchema(defaultColors)

    this.ethContract.balanceOf(selectedAddress, (error, result1) => {
      if (error) {
        throw error
      }
      const numberOfFoxes = result1[0].toNumber()
      const promises = []
      for(let i = 0;i < numberOfFoxes; i++) {
        promises.push(new Promise((resolve,reject) => {
          console.log('$$$ selectedAddress', selectedAddress)
          console.log('$$$ i', i)
          this.ethContract.tokenOfOwnerByIndex(selectedAddress, i, (error, result2) => {
            if (error) {
              return reject(error)
            }
            resolve(result2)
        })}))
      }
      Promise.all(promises)
        .then(results => {
          console.log('$$$ results 2', results)
          this.setState({
            metafoxies: results.map(result => ({
              id: result[0].toString(10),
              colors: uint256ToColors(result[0].toString(10))
            })),
            numberOfFoxes
          })
        })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    const { purchasedButNotRendered, numberOfFoxes } = this.state
    if (!prevState.purchasedButNotRendered && purchasedButNotRendered) {
      this.checkInterval = setInterval(() => {
        this.ethContract.balanceOf(this.props.selectedAddress, (error, result1) => {
          if (error) {
            throw error
          }
          const newNumberOfFoxes = result1[0].toNumber()
          // console.log('$$$ newNumberOfFoxes', newNumberOfFoxes)
          // console.log('$$$ numberOfFoxes + 1', numberOfFoxes + 1)
          if (newNumberOfFoxes === numberOfFoxes + 1) {
            console.log('$$$ newNumberOfFoxes', newNumberOfFoxes)
            console.log('$$$ this.props.selectedAddress', this.props.selectedAddress)
            setTimeout(() => this.ethContract.tokenOfOwnerByIndex(this.props.selectedAddress, numberOfFoxes, (error, result) => {
              if (error) {
                throw error
              }
              console.log('$$$ 1 result[0]', result[0])
              console.log('$$$ result[0].toString(10)', result[0].toString(10))
              this.setState({
                metafoxies: [
                  ...this.state.metafoxies, {
                    id: result[0].toString(10),
                    colors: uint256ToColors(result[0].toString(10))
                  }
                ],
                numberOfFoxes: newNumberOfFoxes,
                purchasedButNotRendered: false
              })
            }), 1000)
          }
        })
      }, 15000)
    } else if (prevState.purchasedButNotRendered && !purchasedButNotRendered) {
      clearInterval(this.checkInterval)
    }
  }

  selectFox = (fox) => {
    // console.log('fox.colors', fox.colors)
    this.setState({
      colors: fox.colors,
      currentFox: fox,
      mode: 'VIEW'
    })
  }

  render () {
    const { password, error, colors, currentFox, foxIDs, metafoxies, selectedSquare, tempColor, errorMessage } = this.state
    const { t } = this.context
    const { onImport, onRestore, selectFoxIcon, selectedAddress } = this.props
    // console.log('render colors', colors)
    // console.log('render hexColorsToRGB(colors)', hexColorsToRGB(colors))
    console.log('colorsToTokenID(colors)', colorsToTokenID(colors))
    return (
      <div className="metafoxies">
        <div className="metafoxies__content">
          <div className="metafoxies__edit">
           
            <div className="fox-color-squares">
              {colors.map((color, i) => {
                return <div
                  type="color"
                  className="fox-color-square"
                  style={{
                    background: selectedSquare === i && tempColor ? tempColor : color,
                    border: selectedSquare === i ? '2px solid white' : 'none'
                  }}
                  onClick={() => this.setState({ selectedSquare: i })}
                >
                  {this.state.selectedSquare === i && <div style={{
                        position: 'fixed',
                        top: '105px',
                        left: '20px',
                  }}><GithubPicker
                    width={'400px'}
                    colors={foxColors}
                    triangle={'hide'}
                    color={ color }
                    onChangeComplete={color => {
                      const newColors = [...colors]
                      newColors[i] = color.hex
                      this.setFoxColorSchema(newColors)
                      this.setState({ colors: newColors, selectedSquare: null, errorMessage: null })
                    }}
                    onSwatchHover={color => {
                      this.setState({ tempColor: color.hex })
                    }}
                  /></div>}
                </div>
              })}
            </div>
            {errorMessage && (
              <ErrorMessage errorMessage={errorMessage} />
            )}
            <div className="metafoxies__controls">
              {this.state.mode === 'CREATE' && <Button
                onClick={() => {
                      global.eth.sendTransaction({
                        from: selectedAddress,
                        to: '0xb7caf15d10cfe0f2cee26b0b784c7b57a5db42b2',
                        value: '0',
                        data: '0x40c10f19000000000000000000000000' + selectedAddress.slice(2) + '000000000000000000000000000000000000000' + (new BigNumber(colorsToTokenID(colors), 10)).toString(16)
                        
                      }, (error, result) => {
                        if (error) {
                          throw error
                        }
                        else {
                          this.setState({ purchasedButNotRendered: true })
                        }
                      })
                  }

                }
                type="primary"
              >
                { 'Mint NFT' }
              </Button>}
              <Button
                onClick={() => {
                  this.setFoxColorSchema(defaultColors)
                  this.setState({ colors: defaultColors, currentFox: {}, mode: 'CREATE' })
                }}
                type="primary"
              >
                { 'Reset' }
              </Button>
            </div>
          </div>
        </div>
        
      </div>
    )
  }
}
