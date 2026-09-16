import { PRICE_STEP } from '../config'

export function nextPriceAfter(price: number): number {
  return price + PRICE_STEP
}
