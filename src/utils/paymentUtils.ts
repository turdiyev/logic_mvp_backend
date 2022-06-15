const ONE_TIYIN = 100;

export function parseToTiyin(priceInSOM) {
  return Number(priceInSOM) * ONE_TIYIN;
}

export function parseToSOM(priceInTiyin) {
  return Number(priceInTiyin) / ONE_TIYIN;
}

export function parseTiyinToSOMString(priceInTiyin) {
  return toPriceFormat(parseToSOM(priceInTiyin));
}

export function toPriceFormat(number, fractionDigits = 0) {
  return Number(number).toFixed(fractionDigits).replace(/(\d)(?=(\d{3})+\b)/g, "$1 ");
}
