const generateStringHexNumber = (string) =>
  (parseInt(parseInt(string, 36).toExponential().slice(2, -5), 10) & 0xffffff)
    .toString(16)
    .toUpperCase();

export const FOX_COLOR_PALETTE = {
  mouthBaseColor: '#D5BFB2', // mouth
  mouthShadow: '#C0AC9D', // mouth shadow
  eyesColor: '#233447', // eyes
  noseColor: '#161616', // nose
  earBaseColor: '#763E1A', // ear base color
  baseSkinTone: '#F5841F', // base skin tone
  primaryShadow: '#CC6228', // darkest shadow
  secondaryShadow: '#E27625', // 2nd shadow
  tertiaryShadow: '#E27525', // 3rd shadow
};
